import { redirect } from "next/navigation"

export default function RootRedirect() {
  redirect("/(customerFacing)")
  return null
}
