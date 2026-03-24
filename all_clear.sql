begin;

update public.teams
set
  pts = 0,
  played = 0,
  gf = 0,
  ga = 0,
  gd = 0,
  off = 0;

update public.match_state
set
  match_index = 0,
  score1 = 0,
  score2 = 0,
  ticker = 'Welcome to Ballers League Vol. II'
where id = 1;

truncate table public.results restart identity;
truncate table public.playoffs;

commit;
