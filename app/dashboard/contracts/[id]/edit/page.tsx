import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getContract } from "@/app/actions/contracts"
import { EditContractForm } from "./edit-form"

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const contract = await getContract(id)
  if (!contract) notFound()

  return <EditContractForm contract={contract} />
}
