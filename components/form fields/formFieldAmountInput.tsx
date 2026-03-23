"use client";

import React, { ReactNode } from "react";
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
} from "../ui/form";
import { Input } from "../ui/input";
import { addCommas } from "@/lib/utils";

interface FormFieldAmountInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    name: string;
    label: string;
    placeholder?: string;
    control: any;
    description?: string | ReactNode;
}


const FormFieldAmountInput = ({
    name,
    label,
    placeholder,
    control,
    description,
    ...inputProps
}: FormFieldAmountInputProps) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const raw =
                    field.value != null && field.value !== ""
                        ? String(field.value).replace(/,/g, "")
                        : "";
                const displayValue = addCommas(raw);

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                inputMode="decimal"
                                className="input appearance-none"
                                placeholder={placeholder}
                                value={displayValue}
                                onChange={(e) => {
                                    const stripped = e.target.value.replace(/,/g, "");
                                    if (stripped !== "" && !/^\d*\.?\d*$/.test(stripped)) return;
                                    field.onChange(stripped);
                                }}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                {...inputProps}
                            />
                        </FormControl>
                        {description && (
                            <FormDescription>{description}</FormDescription>
                        )}
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};

export default React.memo(FormFieldAmountInput);
