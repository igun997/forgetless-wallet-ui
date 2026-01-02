import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Fingerprint, Shield, Zap, ArrowRight, Lock, Globe, Smartphone } from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Passkey Authentication",
    description:
      "Use biometrics or your device PIN to secure your wallet. No seed phrases to remember.",
  },
  {
    icon: Shield,
    title: "Non-Custodial Security",
    description: "Your keys, your crypto. Passkeys are hardware-bound and never leave your device.",
  },
  {
    icon: Zap,
    title: "Instant Transactions",
    description: "Built on Base for fast, low-cost transactions. Deposit and withdraw in seconds.",
  },
];

const benefits = [
  {
    icon: Lock,
    title: "No Seed Phrases",
    description: "Forget about 12-word recovery phrases forever",
  },
  {
    icon: Globe,
    title: "Cross-Device",
    description: "Access your wallet from any device with passkey sync",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Works seamlessly on desktop and mobile browsers",
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 py-16 md:py-24">
        <div className="container max-w-5xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-6xl">
            Your Wallet,{" "}
            <span className="to-chart-1 bg-gradient-to-r from-primary bg-clip-text text-transparent">
              Your Fingerprint
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Forgetless Wallet uses passkeys to eliminate seed phrases forever. Secure, simple, and
            impossible to forget.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Create Wallet
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Connect Existing Wallet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-card/50 py-16">
        <div className="container max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground md:text-3xl">
            Built for the Future
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/50 bg-background/50 transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="bg-chart-1/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                  <benefit.icon className="text-chart-1 h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="to-chart-1/5 border-t border-border bg-gradient-to-br from-primary/5 py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Ready to Go Passwordless?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Create your wallet in under 30 seconds using just your fingerprint or face ID.
          </p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              <Fingerprint className="h-5 w-5" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
