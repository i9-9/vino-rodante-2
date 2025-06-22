# Implementación del CRUD de Direcciones

## Estructura General

```
app/
  account/
    actions/
      addresses.ts      # Server Actions para operaciones CRUD
    components/
      AddressesTab.tsx  # Componente cliente para UI y manejo de estado
    types.ts           # Tipos y interfaces
```

## Tipos y Validación

### Esquema de Validación (Zod)

```typescript
const addressSchema = z.object({
  line1: z.string().min(1, 'La calle y número son requeridos'),
  line2: z.string().optional(),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'La provincia es requerida'),
  postal_code: z.string().min(1, 'El código postal es requerido'),
  country: z.string().min(1, 'El país es requerido'),
  is_default: z.boolean().optional()
})
```

### Tipos TypeScript

```typescript
interface Address {
  id: string
  customer_id: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

interface ActionResponse {
  success: boolean
  error?: string
}
```

## Server Actions (addresses.ts)

### Crear Dirección

```typescript
export async function createAddress(formData: FormData): Promise<ActionResponse> {
  const supabase = createClient()
  
  // 1. Autenticación
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth/sign-in')

  try {
    // 2. Procesar y validar datos
    const rawData = {
      line1: formData.get('line1')?.toString().trim(),
      line2: formData.get('line2')?.toString().trim() || '',
      city: formData.get('city')?.toString().trim(),
      state: formData.get('state')?.toString().trim(),
      postal_code: formData.get('postal_code')?.toString().trim(),
      country: 'Argentina',
      is_default: formData.get('is_default') === 'on'
    }

    const validatedData = addressSchema.parse(rawData)

    // 3. Insertar dirección
    const { error: insertError } = await supabase
      .from('addresses')
      .insert({
        ...validatedData,
        customer_id: user.id
      })

    if (insertError) throw insertError

    // 4. Manejar dirección predeterminada
    if (validatedData.is_default) {
      await setOtherAddressesAsNonDefault(supabase, user.id, null)
    }

    // 5. Revalidar y retornar
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error creating address:', error)
    return { success: false, error: 'Error al crear la dirección' }
  }
}
```

### Actualizar Dirección

```typescript
export async function updateAddress(formData: FormData): Promise<ActionResponse> {
  const supabase = createClient()

  // 1. Autenticación
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth/sign-in')

  const addressId = formData.get('id')?.toString()
  if (!addressId) return { success: false, error: 'ID de dirección no proporcionado' }

  try {
    // 2. Verificar propiedad
    const { data: existingAddress, error: fetchError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('customer_id', user.id)
      .single()

    if (fetchError || !existingAddress) {
      return { 
        success: false, 
        error: 'No se encontró la dirección o no tienes permiso para editarla'
      }
    }

    // 3. Procesar y validar datos
    const rawData = {
      line1: formData.get('line1')?.toString().trim(),
      line2: formData.get('line2')?.toString().trim() || '',
      city: formData.get('city')?.toString().trim(),
      state: formData.get('state')?.toString().trim(),
      postal_code: formData.get('postal_code')?.toString().trim(),
      country: 'Argentina',
      is_default: formData.get('is_default') === 'on'
    }

    const validatedData = addressSchema.parse(rawData)

    // 4. Actualizar dirección
    const { error: updateError } = await supabase
      .from('addresses')
      .update(validatedData)
      .eq('id', addressId)
      .eq('customer_id', user.id)

    if (updateError) throw updateError

    // 5. Manejar dirección predeterminada
    if (validatedData.is_default) {
      await setOtherAddressesAsNonDefault(supabase, user.id, addressId)
    }

    // 6. Revalidar y retornar
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error updating address:', error)
    return { success: false, error: 'Error al actualizar la dirección' }
  }
}
```

### Eliminar Dirección

```typescript
export async function deleteAddress(formData: FormData): Promise<ActionResponse> {
  const supabase = createClient()

  // 1. Autenticación
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth/sign-in')

  const addressId = formData.get('id')?.toString()
  if (!addressId) return { success: false, error: 'ID de dirección no proporcionado' }

  try {
    // 2. Eliminar dirección
    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('customer_id', user.id)

    if (deleteError) throw deleteError

    // 3. Revalidar y retornar
    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error deleting address:', error)
    return { success: false, error: 'Error al eliminar la dirección' }
  }
}
```

## Componente Cliente (AddressesTab.tsx)

### Estado Local

```typescript
const [isPending, startTransition] = useTransition()
const [isAddModalOpen, setIsAddModalOpen] = useState(false)
const [isEditModalOpen, setIsEditModalOpen] = useState(false)
const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
const [error, setError] = useState<string | null>(null)
```

### Manejo de Formularios

Cada operación CRUD sigue este patrón:
1. Validación inicial
2. Preparación de FormData
3. Manejo de estado de carga
4. Llamada al server action
5. Manejo de respuesta
6. Actualización de UI
7. Manejo de errores

Ejemplo:
```typescript
const handleEditAddress = async (formData: FormData) => {
  if (!selectedAddress) return
  
  setError(null)
  formData.append('id', selectedAddress.id)
  
  startTransition(async () => {
    try {
      const result = await updateAddress(formData)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        setIsEditModalOpen(false)
        setSelectedAddress(null)
        toast.success('Dirección actualizada correctamente')
        router.refresh()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setError(message)
      toast.error(message)
    }
  })
}
```

## Mejoras Propuestas

1. **Validación Mejorada**:
   - Agregar validación de código postal por provincia
   - Implementar autocompletado de ciudades por provincia
   - Validar formatos específicos (ej: código postal argentino)

2. **Optimización de Estado**:
   - Implementar SWR o React Query para manejo de cache
   - Usar optimistic updates para mejor UX
   - Implementar revalidación selectiva

3. **Seguridad**:
   - Agregar rate limiting en server actions
   - Implementar validación CSRF
   - Agregar logging de auditoría

4. **UX/UI**:
   - Agregar confirmación antes de cambios importantes
   - Mejorar feedback visual durante operaciones
   - Implementar undo/redo para operaciones

5. **Performance**:
   - Implementar lazy loading para listas largas
   - Agregar paginación
   - Optimizar revalidaciones

6. **Mantenibilidad**:
   - Extraer lógica común a hooks personalizados
   - Mejorar tipado de respuestas de Supabase
   - Agregar tests unitarios y de integración

## Estructura de Base de Datos

```sql
create table addresses (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references auth.users(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'Argentina',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index addresses_customer_id_idx on addresses(customer_id);
create index addresses_is_default_idx on addresses(is_default) where is_default = true;

-- Trigger para updated_at
create trigger set_updated_at
  before update on addresses
  for each row
  execute function update_updated_at_column();

-- RLS Policies
alter table addresses enable row level security;

create policy "Users can view their own addresses"
  on addresses for select
  using (auth.uid() = customer_id);

create policy "Users can insert their own addresses"
  on addresses for insert
  with check (auth.uid() = customer_id);

create policy "Users can update their own addresses"
  on addresses for update
  using (auth.uid() = customer_id);

create policy "Users can delete their own addresses"
  on addresses for delete
  using (auth.uid() = customer_id);
``` 