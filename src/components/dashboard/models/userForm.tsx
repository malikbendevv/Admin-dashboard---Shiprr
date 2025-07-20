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
import api from "@/lib/axiosInstance";

// Address schema
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

// Update password validation in userSchema
const userSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.email(),
  phoneNumber: z.string(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least 1 uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least 1 lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[!@#$%^&*(),.?\":{}|<>]/, {
      message: "Password must contain at least 1 special character",
    })
    .refine((val) => !/\s/.test(val), {
      message: "Password must not contain spaces",
    })
    .optional(),
  role: z.enum(["admin", "customer", "driver"]),
  addresses: z.array(addressSchema).min(1, "At least one address is required"),
});

type UserFormValues = z.infer<typeof userSchema>;

type Address = z.infer<typeof addressSchema>;

interface UserFormProps {
  mode: "add" | "edit";
  initialValues?: Partial<UserFormValues>;
  onSuccess?: () => void;
}

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

// Utility to build a full address string from address object
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

export default function UserForm({
  mode,
  initialValues,
  onSuccess,
}: UserFormProps) {
  const [openMap, setOpenMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isEdit = mode === "edit";
  const addresses = normalizeAddresses(initialValues?.addresses);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
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

  console.log("form errors", form.formState.errors);

  const onSubmit: SubmitHandler<UserFormValues> = async (values) => {
    setLoading(true);
    setSuccess(false);
    // Transform or clean up address if needed before sending to backend
    // e.g., remove empty street2, convert lat/lng to null if not set, etc.

    try {
      console.log("Submitting values:", values);

      const res = await api.post("http://localhost:5000/users", values);

      console.log("Response from the api", { res });

      if (res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onSuccess) onSuccess();
        }, 3000); // Hide success after 3s
      }
    } catch (err) {
      // Check for Axios error and 400 status
      if (err.response && err.response.status === 400) {
        const messages = err.response.data.message;
        if (Array.isArray(messages)) {
          messages.forEach((msg: string) => {
            // Try to match "addresses.N.field" pattern
            const addressMatch = msg.match(
              /^addresses\.(\d+)\.([a-zA-Z0-9_]+) (.+)$/
            );
            if (addressMatch) {
              const [, idx, field, message] = addressMatch;
              // Set error for addresses[idx].field
              form.setError(`addresses.${idx}.${field}` as any, {
                message: msg,
              });
              return;
            }
            // Try to match "field should not be empty" or similar
            const fieldMatch = msg.match(/^([a-zA-Z0-9_]+) (.+)$/);
            if (fieldMatch) {
              const [_, field, message] = fieldMatch;
              form.setError(field as any, { message: msg });
              return;
            }
            // Otherwise, set a general error (optional)
            // form.setError("root", { message: msg });
          });
        }
      } else {
        // Handle other errors (network, 500, etc.)
        // Optionally set a general error message
        form.setError("root", {
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
          User created successfully!
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
            Search Address (first address)
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
                  console.log("address from Map picker", address);
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
                console.log("address from autoComplete", address);
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
