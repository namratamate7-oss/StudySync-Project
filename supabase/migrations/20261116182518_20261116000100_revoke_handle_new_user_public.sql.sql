/*
# Fix handle_new_user execution permissions

The previous migration revoked EXECUTE from anon and authenticated, but
Postgres still grants EXECUTE to PUBLIC by default. This migration revokes
from PUBLIC explicitly to fully close the access path.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
