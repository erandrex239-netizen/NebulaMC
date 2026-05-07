
insert into storage.buckets (id, name, public) values ('news-images', 'news-images', true) on conflict (id) do nothing;

create policy "News images public read"
on storage.objects for select
using (bucket_id = 'news-images');

create policy "Owner upload news images"
on storage.objects for insert
with check (bucket_id = 'news-images' and public.has_role(auth.uid(), 'owner'::public.app_role));

create policy "Owner update news images"
on storage.objects for update
using (bucket_id = 'news-images' and public.has_role(auth.uid(), 'owner'::public.app_role));

create policy "Owner delete news images"
on storage.objects for delete
using (bucket_id = 'news-images' and public.has_role(auth.uid(), 'owner'::public.app_role));
