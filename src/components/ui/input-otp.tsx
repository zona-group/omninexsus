import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function InputOTP({className,containerClassName,...props}:React.ComponentProps<typeof OTPInput>&{containerClassName?:string}){
return<OTPInput data-slot="input-otp" containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50",containerClassName)} className={cn("disabled:cursor-not-allowed",className)} {...props}/>
}

export{InputOTP}