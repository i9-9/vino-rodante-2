import { getAllOrders } from './actions/admin-orders'

export default async function AdminOrdersTable() {
  const { data: orders, error } = await getAllOrders()

  if (error) return <div>Error: {error.message}</div>
  if (!orders || !orders.length) return <div>No hay pedidos.</div>

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Todos los pedidos</h2>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Cliente</th>
            <th className="border px-2 py-1">Estado</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id}>
              <td className="border px-2 py-1">{order.id}</td>
              <td className="border px-2 py-1">{order.customers?.name || order.customers?.email}</td>
              <td className="border px-2 py-1">{order.status}</td>
              <td className="border px-2 py-1">${order.total}</td>
              <td className="border px-2 py-1">{new Date(order.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 