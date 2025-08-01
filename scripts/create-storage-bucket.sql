-- Crear el bucket para imágenes de productos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

-- Política para permitir a usuarios anónimos leer imágenes
create policy "Imágenes públicas para todos"
on storage.objects for select
to anon
using ( bucket_id = 'product-images' );

-- Política para permitir a admins subir imágenes
create policy "Solo admins pueden subir imágenes"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images' 
  and (
    select is_admin from public.customers
    where id = auth.uid()
  )
);

-- Política para permitir a admins actualizar imágenes
create policy "Solo admins pueden actualizar imágenes"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and (
    select is_admin from public.customers
    where id = auth.uid()
  )
)
with check (
  bucket_id = 'product-images'
  and (
    select is_admin from public.customers
    where id = auth.uid()
  )
);

-- Política para permitir a admins eliminar imágenes
create policy "Solo admins pueden eliminar imágenes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (
    select is_admin from public.customers
    where id = auth.uid()
  )
); 