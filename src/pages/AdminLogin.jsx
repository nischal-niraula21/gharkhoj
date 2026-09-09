import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { api, getErrorMessage } from "@/lib/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.error("Please fill in all fields.");
    }

    setLoading(true);

    try {
      const { data } = await api.post("/admin/login", form);

      localStorage.setItem(
        "gharkhoj-admin-token",
        data.token,
      );

      toast.success("Admin login successful");

      navigate("/admin");
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
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-dark text-white">
          <ShieldCheck className="h-7 w-7" />
        </span>

        <h1 className="display text-center text-3xl">
          GharKhoj Admin
        </h1>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          Private administrator access only. There is no public
          admin registration.
        </p>

        <div className="mt-7 space-y-5">
          <div>
            <Label htmlFor="admin-email">Admin Email</Label>

            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="pl-10"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <PasswordInput
            id="admin-password"
            label="Password"
            value={form.password}
            onChange={(password) =>
              setForm({
                ...form,
                password,
              })
            }
          />
        </div>

        <div className="mt-3 text-right">
          <a
            href="/admin/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full font-bold"
        >
          {loading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          Login to Admin Console
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;