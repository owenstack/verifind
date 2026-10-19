import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/verify')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/verify"!</div>
}
