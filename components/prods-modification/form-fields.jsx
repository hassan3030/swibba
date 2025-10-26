import { motion } from "framer-motion"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslations } from "@/lib/use-translations"

const inputVariants = {
  focus: { scale: 1.02, transition: { duration: 0.2 } },
}

export const FormFieldWrapper = ({ children, className = "" }) => (
  <motion.div 
    className={`space-y-2 ${className}`}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    }}
  >
    {children}
  </motion.div>
)

export const TextField = ({ control, name, label, placeholder, description, required = false }) => {
  const { t } = useTranslations()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t(label)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Input
                placeholder={t(placeholder)}
                {...field}
                className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring"
              />
            </motion.div>
          </FormControl>
          {description && (
            <FormDescription className="text-muted-foreground">
              {t(description)}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const TextAreaField = ({ control, name, label, placeholder, description, required = false, rows = 4 }) => {
  const { t } = useTranslations()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t(label)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <motion.div variants={inputVariants} whileFocus="focus">
              <Textarea
                placeholder={t(placeholder)}
                rows={rows}
                {...field}
                className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring resize-none"
              />
            </motion.div>
          </FormControl>
          {description && (
            <FormDescription className="text-muted-foreground">
              {t(description)}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const SelectField = ({ 
  control, 
  name, 
  label, 
  placeholder, 
  description, 
  options, 
  required = false,
  valueKey = "value",
  labelKey = "label"
}) => {
  const { t } = useTranslations()
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t(label)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <motion.div variants={inputVariants} whileFocus="focus">
                <SelectTrigger className="transition-all duration-200 bg-background border-input focus:ring-2 focus:ring-ring/20 focus:border-ring">
                  <SelectValue placeholder={t(placeholder)} />
                </SelectTrigger>
              </motion.div>
            </FormControl>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option[valueKey]}>
                  {t(option[labelKey])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && (
            <FormDescription className="text-muted-foreground">
              {t(description)}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const CheckboxField = ({ control, name, label, description, options }) => {
  const { t } = useTranslations()
  
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">{t(label)}</FormLabel>
            {description && (
              <FormDescription className="text-muted-foreground">
                {t(description)}
              </FormDescription>
            )}
          </div>
          {options.map((item) => (
            <FormField
              key={item.id}
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <FormItem
                    key={item.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, item.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== item.id
                                )
                              )
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t(item.name)}
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
