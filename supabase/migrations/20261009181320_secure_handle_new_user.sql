/*
# Secure handle_new_user function

## Changes
1. Revoke EXECUTE on `handle_new_user` from `anon` and `authenticated` roles.
   This function is only meant to be called by the database trigger on
   `auth.users`, not via the REST API. Leaving it executable by anon/authenticated
   exposes a SECURITY DEFINER function that runs with elevated privileges.

## Security
- Revokes EXECUTE from anon and authenticated roles.
- The trigger still works because triggers run with the function's privileges,
  not the caller's.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
