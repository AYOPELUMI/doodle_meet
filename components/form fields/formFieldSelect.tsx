import React from "react";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Path } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { X } from "lucide-react"; // or any close icon you prefer
import { ScrollArea } from "../ui/scroll-area";

interface FormFieldSelectProps<T extends Record<string, any>> {
    placeholder: string;
    control: any;
    name: Path<T>;
    label: string;
    description?: string;
    values: Array<{ label: string; value: string | number | boolean }>;
    clearable?: boolean;
    disabled?: boolean
}

const FormFieldSelect = <T extends Record<string, any>>({
    control,
    name,
    label,
    description,
    values,
    placeholder,
    clearable = true,
    disabled = false
}: FormFieldSelectProps<T>) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field, formState }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>

                    <FormControl>
                        <div className="relative">
                            <Select
                                disabled={disabled}

                                onValueChange={(val) => {
                                    // Handle clear option
                                    if (val === "__CLEAR__") {
                                        field.onChange(formState.defaultValues?.[name] ?? "");
                                        return;
                                    }

                                    // Convert string back to original type
                                    const original = values.find((v) => v.value.toString() === val)
                                        ?.value;

                                    field.onChange(original ?? val);
                                }}
                                value={field.value?.toString()}

                            >
                                <SelectTrigger className="input capitalize w-full pr-8 bg-background">
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>

                                <ScrollArea>
                                    <SelectContent className="overflow-y-auto" >

                                        {/* Clear option - only show when clearable and there's a value */}
                                        {clearable && field.value !== undefined && field.value !== "" && (
                                            <SelectItem
                                                value="__CLEAR__"
                                                className="text-red-600 hover:text-red-700 focus:text-red-700"
                                            >
                                                Clear selection
                                            </SelectItem>
                                        )}

                                        {values.map((item) => (
                                            <SelectItem
                                                key={item.value.toString()}
                                                value={item.value.toString()}
                                                className="capitalize text-black"
                                            >
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </ScrollArea>
                            </Select>

                            {/* Clear button shown when there's a value and clearable is true */}
                            {!disabled && clearable && field.value !== undefined && field.value !== "" && (
                                <button
                                    type="button"
                                    onClick={() => field.onChange(formState.defaultValues?.[name] ?? "")}
                                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-destructive focus:outline-none"
                                    aria-label="Clear selection"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </FormControl>

                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default FormFieldSelect;