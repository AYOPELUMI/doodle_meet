"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import FormFieldInput from "@/components/form fields/formFieldInput";
import { signInWithGithub, signInWithGoogle } from "@/hooks/social-auth";
import { SignupFormValues, signupSchema } from "@/lib/schemas/sign-up-schema";
import { createSupabaseClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/ensure-profile";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response) => {
        try {
          const payload = JSON.parse(atob(response.credential.split(".")[1]));
          if (payload.name) form.setValue("name", payload.name);
          if (payload.email) form.setValue("email", payload.email);
        } catch (error) {
          console.error("Google prefill failed", error);
        }
      },
      auto_select: false,
      use_fedcm_for_prompt: true,
    });

    window.google.accounts.id.prompt();
  }, [form]);

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard`,
          data: {
            full_name: values.name,
            name: values.name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await ensureProfile(data.user);
      }

      toast.success("Account created. Check your email if confirmation is enabled.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordChecks = [
    { label: "At least 8 characters", met: password?.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password || "") },
    { label: "Contains a number", met: /[0-9]/.test(password || "") },
  ];

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_35%),linear-gradient(135deg,_#fff7ed,_#f8fafc_40%,_#eff6ff)]">
      <div className="hidden lg:flex lg:w-1/2">
        <div className="m-6 flex flex-1 flex-col justify-between rounded-[2.5rem] bg-[linear-gradient(155deg,_#431407,_#b45309_45%,_#f97316)] p-12 text-white shadow-2xl shadow-orange-950/25">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/80">
              Launch faster
            </div>
            <h2 className="mt-8 max-w-md text-4xl font-bold leading-tight font-heading">
              Build your room, invite people, start talking.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/75">
              Sign up for a lightweight meeting workspace with instant rooms,
              scheduled sessions, and call chat that stays connected.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Instant meeting links with pre-join preview",
              "Stream-powered chat, audio, video, and screen sharing",
              "Cookie-backed auth that works across client and server routes",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-3xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-sm text-white/85">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <Video className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading">
              Doodlw Meet
            </span>
          </Link>

          <div className="rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
              Create workspace access
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight font-heading">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start with a clean meeting home for calls, messages, and quick links.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
                <FormFieldInput
                  control={form.control}
                  name="name"
                  label="Full name"
                  placeholder="John Doe"
                />

                <FormFieldInput
                  control={form.control}
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                />

                <FormFieldInput
                  control={form.control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  showPasswordToggle
                  description={
                    password ? (
                      <div className="mt-1 flex flex-col gap-1.5">
                        {passwordChecks.map((check) => (
                          <div
                            key={check.label}
                            className={`flex items-center gap-2 text-xs ${check.met ? "text-green-600" : "text-muted-foreground"}`}
                          >
                            <Check className="h-3 w-3" />
                            {check.label}
                          </div>
                        ))}
                      </div>
                    ) : undefined
                  }
                />

                <Button type="submit" className="h-11 w-full rounded-xl" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or continue with</span>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={signInWithGoogle} type="button" variant="outline" className="h-11 rounded-xl">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </Button>
                  <Button onClick={signInWithGithub} type="button" variant="outline" className="h-11 rounded-xl">
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </Button>
                </div>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  By creating an account, you agree to use Doodlw Meet for
                  collaborative work and real-time communications.
                </p>
              </form>
            </Form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
    </div>
  );
}
