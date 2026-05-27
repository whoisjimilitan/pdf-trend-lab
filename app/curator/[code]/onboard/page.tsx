import OnboardForm from "./OnboardForm";

export default async function OnboardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <OnboardForm code={code} />;
}
