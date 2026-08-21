export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">User Profile</h1>
      <p className="text-muted-foreground mt-2 text-sm">ID: {id}</p>
    </main>
  );
}
