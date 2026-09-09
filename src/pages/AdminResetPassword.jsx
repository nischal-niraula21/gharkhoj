import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";

import { api, getErrorMessage } from "@/lib/api";

const AdminResetPassword = () => {
    const navigate = useNavigate();

    const email =
        sessionStorage.getItem("gharkhoj-admin-reset-email") || "";

    const resetToken =
        sessionStorage.getItem("gharkhoj-admin-reset-token") || "";

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email || !resetToken) {
            navigate("/admin/forgot-password", {
                replace: true,
            });
        }
    }, [email, resetToken, navigate]);

    const submit = async (e) => {
        e.preventDefault();

        if (form.newPassword.length < 8) {
            return toast.error(
                "Password must be at least 8 characters.",
            );
        }

        if (form.newPassword !== form.confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        setLoading(true);

        try {
            await api.post("/admin/reset-password", {
                email,
                resetToken,
                ...form,
            });

            sessionStorage.removeItem(
                "gharkhoj-admin-reset-email",
            );

            sessionStorage.removeItem(
                "gharkhoj-admin-reset-token",
            );

            toast.success("Admin password reset successfully.");

            navigate("/admin/login");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
            <form
                onSubmit={submit}
                className="w-full max-w-md rounded-3xl border bg-card p-8"
                style={{ boxShadow: "var(--card-shadow)" }}
            >
                <ShieldCheck className="mx-auto h-10 w-10 text-primary" />

                <h1 className="display mt-4 text-center text-3xl">
                    Create New Admin Password
                </h1>

                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Enter a new password for the private GharKhoj admin account.
                </p>

                <div className="mt-7 space-y-5">
                    <PasswordInput
                        label="New Password"
                        value={form.newPassword}
                        onChange={(newPassword) =>
                            setForm({
                                ...form,
                                newPassword,
                            })
                        }
                        placeholder="Minimum 8 characters"
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        value={form.confirmPassword}
                        onChange={(confirmPassword) =>
                            setForm({
                                ...form,
                                confirmPassword,
                            })
                        }
                        placeholder="Repeat password"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-full font-bold"
                >
                    {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    Reset Admin Password
                </Button>
            </form>
        </div>
    );
};

export default AdminResetPassword;