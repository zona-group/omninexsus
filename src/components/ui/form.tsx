import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider