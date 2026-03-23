import React from "react"
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
} from "../ui/form"
import { Checkbox } from "../ui/checkbox"

interface FormFieldCheckboxProps {
    name: string
    label: string
    control: any
    description?: string
    disabled?: boolean
}

const FormFieldCheckbox = ({
    name,
    label,
    control,
    description,
    disabled = false,
}: FormFieldCheckboxProps) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>{label}</FormLabel>
                        {description && (
                            <FormDescription>{description}</FormDescription>
                        )}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default FormFieldCheckbox