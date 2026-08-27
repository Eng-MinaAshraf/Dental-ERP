import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const hospitalId = session.user.hospitalId

  // Fetch hospital info
  let hospital = null;
  
  if (hospitalId === "demo-hospital-id") {
    hospital = {
      name: "Demo Dental Clinic",
      plan: "PREMIUM",
      logo: null,
      onboardingCompleted: true,
    };
  } else if (hospitalId) {
    hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        name: true,
        plan: true,
        logo: true,
        onboardingCompleted: true,
      },
    })
  }

  // Redirect to onboarding if not complete (except if already on onboarding page)
  if (hospital && !hospital.onboardingCompleted) {
    redirect("/onboarding")
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email || "",
    role: session.user.role || "RECEPTIONIST",
  }

  const hospitalInfo = hospital
    ? {
        name: hospital.name,
        plan: hospital.plan,
        logo: hospital.logo,
      }
    : undefined

  return (
    <DashboardShell user={user} hospital={hospitalInfo}>
      {children}
    </DashboardShell>
  )
}
