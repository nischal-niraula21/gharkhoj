import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ShieldCheck, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const AdminForgotPassword=()=>{const navigate=useNavigate();const [email,setEmail]=useState("");const [loading,setLoading]=useState(false);const submit=async(e)=>{e.preventDefault();setLoading(true);try{const {data}=await api.post("/admin/forgot-password",{email});sessionStorage.setItem("gharkhoj-admin-reset-email",email.trim().toLowerCase());toast.success(data.message);navigate("/admin/verify-reset-code");}catch(err){toast.error(getErrorMessage(err));}finally{setLoading(false);}};return <AdminShell><form onSubmit={submit} className="w-full max-w-md rounded-3xl border bg-card p-8" style={{boxShadow:"var(--card-shadow)"}}><ShieldCheck className="mx-auto h-10 w-10 text-primary"/><h1 className="display mt-4 text-center text-3xl">Admin Password Recovery</h1><p className="mt-3 text-center text-sm text-muted-foreground">Enter the private admin email. A 6-digit code will be sent if the account exists.</p><div className="mt-7"><Label>Admin Email</Label><div className="relative mt-1"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="pl-10" required/></div></div><Button type="submit" disabled={loading} className="mt-6 w-full rounded-full font-bold">{loading&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Send Verification Code</Button><Link to="/admin/login" className="mt-5 block text-center text-sm font-semibold text-primary">Back to Admin Login</Link></form></AdminShell>};
const AdminShell=({children})=><div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">{children}</div>;
export default AdminForgotPassword;
