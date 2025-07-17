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
import React from "react";
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";

// Address schema
const addressSchema = z.object({
  street: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// User schema
const userSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email(),
  password: z.string().min(6, "Password required").optional(),
  role: z.enum(["admin", "customer", "driver"]),
  status: z.enum(["Active", "Inactive"]),
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
          country: "Algeria",
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
      typeof addr.country === "string" && addr.country
        ? addr.country
        : "Algeria",
    latitude: typeof addr.latitude === "number" ? addr.latitude : undefined,
    longitude: typeof addr.longitude === "number" ? addr.longitude : undefined,
  }));
}

export default function UserForm({
  mode,
  initialValues,
  onSuccess,
}: UserFormProps) {
  const isEdit = mode === "edit";
  const addresses = normalizeAddresses(initialValues?.addresses);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      password: "",
      role: initialValues?.role || "customer",
      status: initialValues?.status || "Active",
      addresses,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addresses",
  });

  console.log("form errors", form.formState.errors);

  console.log("form values", form.formState.defaultValues);

  const onSubmit: SubmitHandler<UserFormValues> = async (values) => {
    // Transform or clean up address if needed before sending to backend
    // e.g., remove empty street2, convert lat/lng to null if not set, etc.
    console.log("Submitting values:", values);
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

      <Controller
        control={form.control}
        name="status"
        render={({ field }) => (
          <>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-600">
                {form.formState.errors.status.message as string}
              </p>
            )}
          </>
        )}
      />

      <div>
        <h3 className="font-semibold mb-2">Addresses</h3>
        {/* Address Autocomplete for the first address only */}
        <div className="mb-2">
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
              htmlFor={`google-autocomplete-${idx}`}
              className="block text-sm font-medium text-gray-700"
            >
              Address {idx + 1}
            </label>
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
              value={form.watch(`addresses.${idx}.street`)}
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
              country: "Algeria",
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

      <Button type="submit">{isEdit ? "Update" : "Add"} User</Button>
    </form>
  );
}
