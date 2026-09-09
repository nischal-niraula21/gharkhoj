import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PasswordInput = ({
    label = "Password",
    value,
    onChange,
    placeholder = "••••••••",
    id,
}) => {
    const [show, setShow] = useState(false);

    return (
        <div>
            <Label htmlFor={id}>{label}</Label>

            <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                />

                <button
                    type="button"
                    onClick={() => setShow((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;