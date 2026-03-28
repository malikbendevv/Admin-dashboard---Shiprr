import {
  Controller,
  useForm,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";
import MapPicker from "@/components/shared/MapPicker";
import { geocodeLatLng } from "@/lib/geoCode";
import { addUser, editUser } from "@/lib/api/users";
import { useQueryClient } from "@tanstack/react-query";
import type { Address as AddressType } from "@/types";

// Address schema (shape matches the Address type from @/types)
const addressSchema = z.object({
  street: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
type Address = AddressType;

function normalizeAddresses(addresses: unknown): Address[] {
  const arr: Record<string, unknown>[] = Array.isArray(addresses)
    ? (addresses as Record<string, unknown>[])
    : [
        {
          street: "",
          street2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          latitude: undefined,
          longitude: undefined,
        },
      ];
  return arr.map((addr) => ({
    street: typeof addr.street === "string" ? addr.street : "",
    street2: typeof addr.street2 === "string" ? addr.street2 : "",
    city: typeof addr.city === "string" ? addr.city : "",
    state: typeof addr.state === "string" ? addr.state : "",
    zipCode: typeof addr.zipCode === "string" ? addr.zipCode : "",
    country:
      typeof addr.country === "string" && addr.country ? addr.country : "",
    latitude: typeof addr.latitude === "number" ? addr.latitude : undefined,
    longitude: typeof addr.longitude === "number" ? addr.longitude : undefined,
  }));
}

function buildFullAddress(address: Partial<Address> = {}) {
  return [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

// Move passwordField and userSchema outside the component as functions
function passwordField(mode: "add" | "edit") {
  return mode === "add"
    ? z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, {
          message: "Password must contain at least 1 uppercase letter",
        })
        .regex(/[a-z]/, {
          message: "Password must contain at least 1 lowercase letter",
        })
        .regex(/[0-9]/, {
          message: "Password must contain at least 1 number",
        })
        .regex(/[!@#$%^&*(),.?\":{}|<>]/, {
          message: "Password must contain at least 1 special character",
        })
        .refine((val) => !/\s/.test(val), {
          message: "Password must not contain spaces",
        })
    : z.string().optional();
}

function userSchema(mode: "add" | "edit") {
  return z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.email(),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?[\d\s\-()]{8,}$/, {
        message:
          "Enter a valid phone number (e.g., +1234567890 or 123-456-7890)",
      }),
    password: passwordField(mode),
    role: z.enum(["admin", "customer", "driver"]),
    addresses: z
      .array(addressSchema)
      .min(1, "At least one address is required"),
  });
}

type UserFormValues = z.infer<ReturnType<typeof userSchema>>;

interface UserFormProps {
  mode: "add" | "edit";
  initialValues?: Partial<UserFormValues>;
  onSuccess?: () => void;
}

export default function UserForm(props: UserFormProps) {
  const { mode, initialValues, onSuccess } = props;
  const [openMap, setOpenMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isEdit = mode === "edit";
  const addresses = normalizeAddresses(initialValues?.addresses);

  const queryClient = useQueryClient();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema(mode)),
    defaultValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      phoneNumber: initialValues?.phoneNumber || "",
      password: "",
      role: initialValues?.role || "customer",
      addresses,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addresses",
  });

  // Add a type for initialValues with id
  type InitialValuesWithId = Partial<UserFormValues> & { id?: string };

  const onSubmit: SubmitHandler<UserFormValues> = async (values) => {
    setLoading(true);
    setSuccess(false);
    const submitValues = { ...values };
    if (isEdit && !submitValues.password) {
      delete submitValues.password;
    }
    try {
      let res;
      if (
        isEdit &&
        initialValues &&
        (initialValues as InitialValuesWithId).id
      ) {
        res = await editUser(
          (initialValues as InitialValuesWithId).id!,
          submitValues
        );
      } else {
        res = await addUser(submitValues);
      }
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          queryClient.invalidateQueries({ queryKey: ["users"] });
          if (onSuccess) onSuccess();
        }, 3000);
      }
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (
          err as {
            response?: { status?: number; data?: { message?: string[] } };
          }
        ).response &&
        (err as { response: { status: number } }).response.status === 400
      ) {
        const messages = (err as { response: { data: { message: string[] } } })
          .response.data.message;
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => {
            const addressMatch = msg.match(
              /^addresses\.(\d+)\.([a-zA-Z0-9_]+) (.+)$/
            );
            if (addressMatch) {
              const [, idx, field] = addressMatch;
              form.setError(
                `addresses.${idx}.${field}` as keyof UserFormValues,
                {
                  message: msg,
                }
              );
              return;
            }
            const fieldMatch = msg.match(/^([a-zA-Z0-9_]+) (.+)$/);
            if (fieldMatch) {
              const [, field] = fieldMatch;
              form.setError(field as keyof UserFormValues, { message: msg });
              return;
            }
          });
        }
      } else {
        form.setError("root" as keyof UserFormValues, {
          message: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {success && (
        <div className="text-green-600 text-sm font-semibold">
          {isEdit ? "User updated successfully!" : "User created successfully!"}
        </div>
      )}
      <Input {...form.register("firstName")} placeholder="First Name" />
      {form.formState.errors.firstName && (
        <p className="text-sm text-red-600">
          {form.formState.errors.firstName.message as string}
        </p>
      )}

      <Input {...form.register("lastName")} placeholder="Last Name" />
      {form.formState.errors.lastName && (
        <p className="text-sm text-red-600">
          {form.formState.errors.lastName.message as string}
        </p>
      )}

      <Input {...form.register("email")} placeholder="Email" />
      {form.formState.errors.email && (
        <p className="text-sm text-red-600">
          {form.formState.errors.email.message as string}
        </p>
      )}

      {/* Phone Number Field */}
      <Input {...form.register("phoneNumber")} placeholder="Phone Number" />
      {form.formState.errors.phoneNumber && (
        <p className="text-sm text-red-600">
          {form.formState.errors.phoneNumber.message as string}
        </p>
      )}

      {!isEdit && (
        <>
          <Input
            {...form.register("password")}
            placeholder="Password"
            type="password"
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">
              {form.formState.errors.password.message as string}
            </p>
          )}
        </>
      )}

      <Controller
        control={form.control}
        name="role"
        render={({ field }) => (
          <>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-600">
                {form.formState.errors.role.message as string}
              </p>
            )}
          </>
        )}
      />

      <div>
        <h3 className="font-semibold mb-2">Addresses</h3>
        {/* Address Autocomplete for the first address only */}
        <div className="mb-2 flex  justify-between  ">
          <label
            htmlFor="google-autocomplete"
            className="block text-sm font-medium text-gray-700"
          >
            {/* Search Address (first address) */}
          </label>
        </div>
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="mb-4 border p-3 rounded space-y-2 relative"
          >
            <label
              htmlFor="google-autocomplete"
              className="block text-sm font-medium text-blue-500 cursor-pointer"
              onClick={() => {
                setOpenMap(true);
              }}
            >
              Choose on map
            </label>
            <label
              htmlFor={`google-autocomplete-${idx}`}
              className="block text-sm font-medium text-gray-700"
            >
              Address {idx + 1}
            </label>

            {openMap && (
              <MapPicker
                open={openMap}
                onClose={() => setOpenMap(false)}
                onSelect={async (lat, lng) => {
                  const address = await geocodeLatLng(lat, lng);
                  if (address) {
                    form.setValue(`addresses.${idx}.street`, address.street, {
                      shouldValidate: true,
                    });
                    form.setValue(`addresses.${idx}.city`, address.city, {
                      shouldValidate: true,
                    });
                    form.setValue(`addresses.${idx}.state`, address.state, {
                      shouldValidate: true,
                    });
                    form.setValue(`addresses.${idx}.zipCode`, address.zip, {
                      shouldValidate: true,
                    });
                    form.setValue(`addresses.${idx}.country`, address.country, {
                      shouldValidate: true,
                    });
                    form.setValue(
                      `addresses.${idx}.latitude`,
                      address.latitude,
                      { shouldValidate: true }
                    );
                    form.setValue(
                      `addresses.${idx}.longitude`,
                      address.longitude,
                      { shouldValidate: true }
                    );
                  }

                  setOpenMap(false);
                }}
                initialPosition={{
                  lat: form.watch("addresses.0.latitude") || 36.7538,
                  lng: form.watch("addresses.0.longitude") || 3.0588,
                }}
              />
            )}

            <AddressAutocomplete
              id={`google-autocomplete-${idx}`}
              onSelect={(address) => {
                form.setValue(`addresses.${idx}.street`, address.street || "", {
                  shouldValidate: true,
                });
                form.setValue(`addresses.${idx}.city`, address.city || "", {
                  shouldValidate: true,
                });
                form.setValue(`addresses.${idx}.state`, address.state || "", {
                  shouldValidate: true,
                });
                form.setValue(`addresses.${idx}.zipCode`, address.zip || "", {
                  shouldValidate: true,
                });
                form.setValue(
                  `addresses.${idx}.country`,
                  address.country || "",
                  { shouldValidate: true }
                );
                if (address.latitude && address.longitude) {
                  form.setValue(`addresses.${idx}.latitude`, address.latitude, {
                    shouldValidate: true,
                  });
                  form.setValue(
                    `addresses.${idx}.longitude`,
                    address.longitude,
                    { shouldValidate: true }
                  );
                }
              }}
              value={buildFullAddress(form.watch(`addresses.${idx}`) || {})}
            />

            {/* Register hidden fields for validation */}
            <input
              type="hidden"
              {...form.register(`addresses.${idx}.street`)}
            />
            <input type="hidden" {...form.register(`addresses.${idx}.city`)} />
            <input type="hidden" {...form.register(`addresses.${idx}.state`)} />
            <input
              type="hidden"
              {...form.register(`addresses.${idx}.zipCode`)}
            />
            <input
              type="hidden"
              {...form.register(`addresses.${idx}.country`)}
            />
            <input
              type="hidden"
              {...form.register(`addresses.${idx}.latitude`)}
            />
            <input
              type="hidden"
              {...form.register(`addresses.${idx}.longitude`)}
            />
            {/* Address field errors */}
            {["street", "zipCode", "city", "state", "country"].map(
              (fieldName) => {
                const key = fieldName as keyof Address;
                return form.formState.errors.addresses?.[idx]?.[key] ? (
                  <p key={fieldName} className="text-sm text-red-600">
                    {
                      form.formState.errors.addresses[idx][key]
                        ?.message as string
                    }
                  </p>
                ) : null;
              }
            )}
            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => remove(idx)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              street: "",
              street2: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
              latitude: undefined,
              longitude: undefined,
            })
          }
        >
          Add Address
        </Button>
        {form.formState.errors.addresses &&
          typeof form.formState.errors.addresses.message === "string" && (
            <p className="text-sm text-red-600">
              {form.formState.errors.addresses.message}
            </p>
          )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : isEdit ? "Update User" : "Create User"}
      </Button>
    </form>
  );
}
