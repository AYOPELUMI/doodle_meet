"use client"

import React, { ReactNode, useState } from "react"
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
} from "../ui/form"
import { Input } from "../ui/input"
import { Eye, EyeOff } from "lucide-react"

interface FormFieldInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string
    label: string
    placeholder?: string
    control: any
    description?: string | ReactNode
    showPasswordToggle?: boolean
}

const FormFieldInput = ({
    name,
    label,
    placeholder,
    control,
    description,
    showPasswordToggle = false,
    ...inputProps // 👈 all native input attributes
}: FormFieldInputProps) => {

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const inputType = showPasswordToggle && inputProps.type === 'password' ? (showPassword ? 'text' : 'password') : inputProps.type;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>

                    <FormControl>
                        <div className="relative">

                            <Input
                                className={`input `}
                                {...inputProps}
                                type={inputType}
                                placeholder={placeholder}
                                {...field}
                            />
                            {showPasswordToggle && inputProps.type === 'password' && (
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    </FormControl>

                    {description && (
                        <FormDescription>{description}</FormDescription>
                    )}

                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default React.memo(FormFieldInput);
