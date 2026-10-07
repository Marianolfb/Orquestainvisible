#!/usr/bin/perl
# Genera "Próximas fechas" en los 7 idiomas a partir de la planilla de Google (CSV):
#   - las filas visibles de la sección #conciertos
#   - el JSON-LD de eventos (SEO-BOOST: eventos)
#   - la frase "Próxima fecha: ..." de la bio en español
# Uso: perl scripts/build_fechas.pl fechas.csv [raiz-del-sitio]
# La planilla es la fuente de verdad: lo que se cargue a mano en esas zonas del HTML se pisa.
# Si algo de la planilla está mal, no toca nada y sale con error (el sitio queda como estaba).
use strict; use warnings; use utf8;
use Encode qw(decode encode);
use JSON::PP;
use Time::Local qw(timegm);
use Unicode::Normalize qw(NFD);
binmode(STDOUT, ':encoding(UTF-8)');
binmode(STDERR, ':encoding(UTF-8)');

my ($csv_path, $root) = @ARGV;
die "uso: build_fechas.pl fechas.csv [raiz]\n" unless defined $csv_path;
$root //= '.';
my $BASE = 'https://www.orquestainvisible.musica.ar';
my $VISIBLES = 2;    # cuántas fechas se ven siempre; el resto queda detrás de "ver todas las fechas"

my @LANGS = qw(es en it fr de ja pt);
my %FILE   = (es=>'index.html', en=>'en/index.html', it=>'it/index.html', fr=>'fr/index.html',
              de=>'de/index.html', ja=>'ja/index.html', pt=>'pt/index.html');
my %AGENDA = (es=>'agenda.html', en=>'en/agenda.html', it=>'it/agenda.html', fr=>'fr/agenda.html',
              de=>'de/agenda.html', ja=>'ja/agenda.html', pt=>'pt/agenda.html');
my %SEP    = (es=>' - ', en=>' - ', it=>' – ', fr=>' – ', de=>' – ', ja=>' ／ ', pt=>' - ');
my %CABA   = (es=>'CABA', en=>'Buenos Aires', it=>'Buenos Aires', fr=>'Buenos Aires', de=>'Buenos Aires',
              ja=>'ブエノスアイレス', pt=>'Buenos Aires');
my %BOOK   = (es=>'RESERVAR', en=>'BOOK NOW', it=>'PRENOTA', fr=>'RÉSERVER', de=>'RESERVIEREN',
              ja=>'予約する', pt=>'RESERVAR');
my %EMPTY  = (es=>'Próximamente, nuevas fechas.', en=>'New dates coming soon.', it=>'Nuove date in arrivo.',
              fr=>'De nouvelles dates bientôt.', de=>'Neue Termine folgen in Kürze.',
              ja=>'新しい公演日は近日発表予定です。', pt=>'Novas datas em breve.');
my %DESC   = (
    es=>'La Orquesta Invisible toca en vivo en {L}, {C}.',
    en=>'Orquesta Invisible plays live at {L}, {C}.',
    it=>"L'Orquesta Invisible suona dal vivo a {L}, {C}.",
    fr=>"L'Orquesta Invisible joue en live à {L}, {C}.",
    de=>'Orquesta Invisible spielt live in {L}, {C}.',
    ja=>'オルケスタ・インビシブレが{L}（{C}）でライブ演奏します。',
    pt=>'A Orquesta Invisible toca ao vivo em {L}, {C}.',
);
my %BRAND  = (es=>'Orquesta Invisible', en=>'Orquesta Invisible', it=>'Orquesta Invisible', fr=>'Orquesta Invisible',
              de=>'Orquesta Invisible', ja=>'オルケスタ・インビシブレ', pt=>'Orquesta Invisible');
my @DIAS  = qw(Domingo Lunes Martes Miércoles Jueves Viernes Sábado);
my @MESES = qw(Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre);

sub fail { my $m = shift; print STDERR "ERROR: $m\n"; exit 1; }
sub norm { my $s = lc(shift // ''); $s = NFD($s); $s =~ s/\p{Mn}//g; $s =~ s/^\s+|\s+$//g; return $s; }
sub trim { my $s = shift // ''; $s =~ s/^\s+|\s+$//g; return $s; }
sub he   { my $s = shift // ''; $s =~ s/&/&amp;/g; $s =~ s/</&lt;/g; $s =~ s/>/&gt;/g; $s =~ s/"/&quot;/g; return $s; }

# ---------- hoy en Buenos Aires (UTC-3, sin horario de verano) ----------
my $today;
if ($ENV{TODAY}) { $today = $ENV{TODAY}; }
else { my @t = gmtime(time - 3*3600); $today = sprintf('%04d-%02d-%02d', $t[5]+1900, $t[4]+1, $t[3]); }

# ---------- CSV ----------
open my $cfh, '<:raw', $csv_path or fail("no pude abrir $csv_path: $!");
local $/; my $bytes = <$cfh>; close $cfh;
my $text = decode('UTF-8', $bytes);
$text =~ s/^\x{FEFF}//;
fail('la planilla descargada no es un CSV (¿cambió el link publicado?)') if $text =~ /^\s*</;

sub parse_csv {
    my ($t) = @_;
    my (@rows, @row); my ($field, $inq) = ('', 0);
    my $n = length $t;
    for (my $i = 0; $i < $n; $i++) {
        my $c = substr($t, $i, 1);
        if ($inq) {
            if ($c eq '"') { if (substr($t, $i+1, 1) eq '"') { $field .= '"'; $i++; } else { $inq = 0; } }
            else { $field .= $c; }
        } else {
            if    ($c eq '"') { $inq = 1; }
            elsif ($c eq ',') { push @row, $field; $field = ''; }
            elsif ($c eq "\n" || $c eq "\r") {
                $i++ if $c eq "\r" && substr($t, $i+1, 1) eq "\n";
                push @row, $field; $field = ''; push @rows, [@row]; @row = ();
            } else { $field .= $c; }
        }
    }
    if (length $field || @row) { push @row, $field; push @rows, [@row]; }
    return @rows;
}
my @all = parse_csv($text);

# encabezados
my ($hdr_idx) = grep { grep { norm($_) =~ /^fecha/ } @{$all[$_]} } 0..$#all;
fail('no encontré la fila de encabezados (columna "Fecha") en la planilla') unless defined $hdr_idx;
my %col;
for my $i (0 .. $#{$all[$hdr_idx]}) {
    my $h = norm($all[$hdr_idx][$i]);
    next unless length $h;
    if    ($h =~ /^fecha/)                     { $col{fecha}   //= $i }
    elsif ($h =~ /^hora de cierre|^cierre/)    { $col{cierre}  //= $i }
    elsif ($h =~ /^hora/)                      { $col{hora}    //= $i }
    elsif ($h =~ /^nombre/)                    { $col{nombre}  //= $i }
    elsif ($h =~ /^lugar/)                     { $col{lugar}   //= $i }
    elsif ($h =~ /^calle/)                     { $col{calle}   //= $i }
    elsif ($h =~ /^ciudad/)                    { $col{ciudad}  //= $i }
    elsif ($h =~ /^bot/)                       { $col{boton}   //= $i }
    elsif ($h =~ /^link/)                      { $col{link}    //= $i }
    elsif ($h =~ /^precio/)                    { $col{precio}  //= $i }
    elsif ($h =~ /^organiza/)                  { $col{organiza}//= $i }
    elsif ($h =~ /^mostrar/)                   { $col{mostrar} //= $i }
    elsif ($h =~ /^pais/)                      { $col{pais}    //= $i }
    elsif ($h =~ /^moneda/)                    { $col{moneda}  //= $i }
}
for my $k (qw(fecha hora nombre)) { fail("falta la columna \"$k\" en la planilla") unless defined $col{$k}; }

sub parse_date {
    my ($s) = @_;
    my ($d, $m, $y);
    if    ($s =~ m{^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$}) { ($d, $m, $y) = ($1, $2, $3); }
    elsif ($s =~ m{^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2})$})  { ($d, $m, $y) = ($1, $2, 2000 + $3); }
    elsif ($s =~ m{^(\d{4})-(\d{1,2})-(\d{1,2})$})            { ($y, $m, $d) = ($1, $2, $3); }
    else { return undef; }
    return undef if $m < 1 || $m > 12 || $d < 1 || $d > 31;
    my $ok = eval { timegm(0, 0, 12, $d, $m - 1, $y); 1 };
    return undef unless $ok;
    my @chk = gmtime(timegm(0, 0, 12, $d, $m - 1, $y));
    return undef unless $chk[3] == $d && $chk[4] == $m - 1;   # 31/04 y similares
    return { y => $y+0, m => $m+0, d => $d+0, iso => sprintf('%04d-%02d-%02d', $y, $m, $d) };
}
sub parse_time {
    my ($s) = @_;
    return [undef] if $s eq '';                       # sin horario
    my $t = lc $s; $t =~ s/\s+//g; $t =~ s/\.//g;
    return undef unless $t =~ /^(\d{1,2})(?:[:h](\d{2}))?(?::\d{2})?(am|pm)?(?:hs|hrs|h)?$/;
    my ($h, $m, $ap) = ($1, $2 // 0, $3);
    if ($ap) { $h %= 12; $h += 12 if $ap eq 'pm'; }
    return undef if $h > 23 || $m > 59;
    return [$h + 0, $m + 0];
}
sub parse_price {
    my ($s) = @_;
    return undef if $s eq '';
    return 0 if norm($s) =~ /^(gratis|gratuito|libre|free|a la gorra)$/;
    my $p = $s; $p =~ s/[^\d.,]//g;
    return 'ERR' unless $p =~ /\d/;
    $p =~ s/[.,](?=\d{3}(?:\D|$))//g;     # separador de miles
    $p =~ s/,/./g;
    return $p + 0;
}

my (@events, @errors);
for my $ri ($hdr_idx + 1 .. $#all) {
    my $r = $all[$ri]; my $line = $ri + 1;
    my $cell = sub { my $k = shift; return defined $col{$k} && defined $r->[$col{$k}] ? trim($r->[$col{$k}]) : ''; };
    next unless grep { length trim($_) } @$r;
    my %e = (line => $line);
    if (norm($cell->('mostrar')) =~ /^(no|n|0|false|oculto)$/) { next; }
    $e{nombre} = $cell->('nombre');
    my $fecha = $cell->('fecha');
    unless (length $e{nombre} || length $fecha) { next; }
    push @errors, "fila $line: falta el Nombre" unless length $e{nombre};
    my $d = parse_date($fecha);
    unless ($d) { push @errors, "fila $line: la Fecha \"$fecha\" no se entiende (usar DD/MM/AAAA)"; next; }
    next if $d->{iso} lt $today;            # ya pasó: se ignora la fila entera (aunque tenga otros datos raros)
    $e{date} = $d;
    my $t = parse_time($cell->('hora'));
    unless ($t) { push @errors, "fila $line: la Hora \"" . $cell->('hora') . "\" no se entiende (usar HH:MM)"; next; }
    $e{time} = $t->[0] // undef; $e{min} = $t->[1];
    my $tc = parse_time($cell->('cierre'));
    unless ($tc) { push @errors, "fila $line: la Hora de cierre \"" . $cell->('cierre') . "\" no se entiende"; next; }
    $e{end_h} = $tc->[0]; $e{end_m} = $tc->[1];
    $e{lugar}  = length $cell->('lugar')  ? $cell->('lugar')  : $e{nombre};
    $e{calle}  = $cell->('calle');
    $e{ciudad} = length $cell->('ciudad') ? $cell->('ciudad') : 'CABA';
    $e{link}   = $cell->('link');
    push @errors, "fila $line: el Link debe empezar con http" if length $e{link} && $e{link} !~ m{^https?://}i;
    # Botón: "Reservar" (link de entradas), "Más info" (página del evento) o vacío = automático
    my $b = norm($cell->('boton'));
    if    ($b eq '')                                            { $e{boton} = length $e{link} ? 'reservar' : 'info'; }
    elsif ($b =~ /^(reservar|reserva|entradas|tickets?)$/)      { $e{boton} = 'reservar'; }
    elsif ($b =~ /^(mas info|mas informacion|info|informacion)$/) { $e{boton} = 'info'; }
    else { push @errors, "fila $line: el Botón \"" . $cell->('boton') . "\" debe ser Reservar o Más info"; next; }
    push @errors, "fila $line: el Botón es Reservar pero falta el Link de entradas" if $e{boton} eq 'reservar' && !length $e{link};
    my $p = parse_price($cell->('precio'));
    if (defined $p && $p eq 'ERR') { push @errors, "fila $line: el Precio \"" . $cell->('precio') . "\" no se entiende"; next; }
    $e{precio} = $p;
    $e{organiza} = norm($cell->('organiza')) =~ /^(si|s|yes|y|1|true)$/ ? 1 : 0;
    $e{pais}   = length $cell->('pais')   ? uc $cell->('pais')   : 'AR';
    $e{moneda} = length $cell->('moneda') ? uc $cell->('moneda') : 'ARS';
    push @errors, "fila $line: País \"$e{pais}\" debe ser un código de 2 letras (AR, DE, IT...)" unless $e{pais} =~ /^[A-Z]{2}$/;
    push @errors, "fila $line: Moneda \"$e{moneda}\" debe ser un código de 3 letras (ARS, EUR...)" unless $e{moneda} =~ /^[A-Z]{3}$/;
    push @events, \%e;
}
if (@errors) { fail("hay datos que no entiendo en la planilla; no se tocó el sitio:\n  - " . join("\n  - ", @errors)); }

@events = sort { $a->{date}{iso} cmp $b->{date}{iso} || (($a->{time} // -1) <=> ($b->{time} // -1)) } @events;

# ---------- formateo por idioma ----------
sub city_display { my ($lang, $e) = @_; return norm($e->{ciudad}) eq 'caba' ? $CABA{$lang} : $e->{ciudad}; }
sub tfmt {
    my ($lang, $h, $m) = @_;
    return sprintf('%02d:%02d HS', $h, $m)  if $lang eq 'es';
    if ($lang eq 'en') { my $h12 = $h % 12 || 12; return sprintf('%d:%02d %s', $h12, $m, $h < 12 ? 'AM' : 'PM'); }
    return sprintf('ore %02d:%02d', $h, $m) if $lang eq 'it';
    return sprintf('%02dh%02d', $h, $m)     if $lang eq 'fr';
    return sprintf('%02d:%02d Uhr', $h, $m) if $lang eq 'de';
    return sprintf('%02d:%02d', $h, $m);
}
sub dfmt {
    my ($lang, $d) = @_;
    return sprintf('%04d.%02d.%02d', $d->{y}, $d->{m}, $d->{d}) if $lang eq 'ja';
    return sprintf('%02d.%02d.%02d ', $d->{d}, $d->{m}, $d->{y} % 100);
}
sub show_address {
    my ($lang, $e) = @_;
    my @parts;
    push @parts, $e->{lugar} if norm($e->{lugar}) ne norm($e->{nombre});
    push @parts, $e->{calle} if length $e->{calle};
    push @parts, city_display($lang, $e);
    return join(', ', @parts);
}
sub row_html {
    my ($lang, $e, $ind) = @_;
    my $addr = show_address($lang, $e);
    my $p = defined $e->{time} ? tfmt($lang, $e->{time}, $e->{min}) . $SEP{$lang} . $addr : $addr;
    my $btn = $e->{boton} eq 'reservar'
        ? sprintf('<a href="%s" target="_blank" class="btn-ticket">%s</a>', he($e->{link}), $BOOK{$lang})
        : length $e->{link}
            ? sprintf('<a href="%s" target="_blank" class="btn-ticket">+INFO</a>', he($e->{link}))
            : '<a href="agenda.html" class="btn-ticket">+INFO</a>';
    my $i0 = ' ' x $ind; my $i1 = ' ' x ($ind + 4); my $i2 = ' ' x ($ind + 8);
    return "$i0<div class=\"show-row reveal\">\n"
         . "$i1<div class=\"show-date\">" . dfmt($lang, $e->{date}) . "</div>\n"
         . "$i1<div class=\"show-info\">\n"
         . "$i2<h3>" . he($e->{nombre}) . "</h3>\n"
         . "$i2<p>" . he($p) . "</p>\n"
         . "$i1</div>\n"
         . "$i1<div class=\"show-action\">\n"
         . "$i2$btn\n"
         . "$i1</div>\n"
         . "$i0</div>\n";
}
sub schema_events {
    my ($lang) = @_;
    my @out;
    for my $e (@events) {
        my $url = length $e->{link} ? $e->{link} : "$BASE/$AGENDA{$lang}";
        my $off = $e->{pais} eq 'AR' ? '-03:00' : '';
        my $start = $e->{date}{iso};
        my $end;
        if (defined $e->{time}) {
            $start .= sprintf('T%02d:%02d:00%s', $e->{time}, $e->{min}, $off);
            if (defined $e->{end_h}) {
                my $eiso = $e->{date}{iso};
                if ($e->{end_h} * 60 + $e->{end_m} <= $e->{time} * 60 + $e->{min}) {      # cierra después de medianoche
                    my @n = gmtime(timegm(0, 0, 12, $e->{date}{d}, $e->{date}{m} - 1, $e->{date}{y}) + 86400);
                    $eiso = sprintf('%04d-%02d-%02d', $n[5] + 1900, $n[4] + 1, $n[3]);
                }
                $end = sprintf('%sT%02d:%02d:00%s', $eiso, $e->{end_h}, $e->{end_m}, $off);
            }
        }
        my $locality = norm($e->{ciudad}) eq 'caba' ? 'Buenos Aires' : $e->{ciudad};
        my %addr = ('@type' => 'PostalAddress', addressLocality => $locality, addressCountry => $e->{pais});
        $addr{streetAddress} = $e->{calle} if length $e->{calle};
        my $desc = $DESC{$lang};
        my $L = $e->{lugar}; my $C = city_display($lang, $e);
        $desc =~ s/\{L\}/$L/g; $desc =~ s/\{C\}/$C/g;
        my %ev = (
            '@type' => 'Event',
            name => "$BRAND{$lang} – $e->{nombre}",
            description => $desc,
            startDate => $start,
            eventStatus => 'https://schema.org/EventScheduled',
            eventAttendanceMode => 'https://schema.org/OfflineEventAttendanceMode',
            url => $url,
            image => "$BASE/og-image.jpg",
            location => { '@type' => 'Place', name => $e->{lugar}, address => \%addr },
            performer => { '@type' => 'MusicGroup', name => 'Orquesta Invisible', url => "$BASE/" },
        );
        $ev{endDate} = $end if defined $end;
        $ev{organizer} = { '@type' => 'Organization', name => 'Orquesta Invisible', url => "$BASE/" } if $e->{organiza};
        if (defined $e->{precio}) {
            $ev{offers} = { '@type' => 'Offer', url => ($e->{boton} eq 'reservar' ? $e->{link} : $url), price => "$e->{precio}", priceCurrency => $e->{moneda},
                            availability => 'https://schema.org/InStock' };
        }
        push @out, \%ev;
    }
    return @out;
}
sub schema_block {
    my ($lang) = @_;
    my $json = JSON::PP->new->canonical->indent->indent_length(2)->space_after;
    my $txt = $json->encode({ '@context' => 'https://schema.org', '@graph' => [ schema_events($lang) ] });
    $txt =~ s{</}{<\\/}g;
    $txt =~ s/\n+$//;
    $txt =~ s/^/    /mg;
    return "    <!-- SEO-BOOST: eventos -->\n    <script type=\"application/ld+json\">\n$txt\n    </script>";
}
sub bio_sentence {
    return 'Próxima fecha: a confirmar.' unless @events;
    my $d = $events[0]{date};
    my @w = gmtime(timegm(0, 0, 12, $d->{d}, $d->{m} - 1, $d->{y}));
    return sprintf('Próxima fecha: %s %d de %s de %d.', $DIAS[$w[6]], $d->{d}, $MESES[$d->{m} - 1], $d->{y});
}

# ---------- agenda propia (reemplaza al calendario de Google embebido) + archivo .ics ----------
my $AGENDA_CSS_V = 5;   # subir este número cuando cambie agenda.css (evita que el navegador use el viejo)
my ($today_year) = $today =~ /^(\d{4})/;
my %MON = (
    es => [qw(ENE FEB MAR ABR MAY JUN JUL AGO SEP OCT NOV DIC)],
    en => [qw(JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC)],
    it => [qw(GEN FEB MAR APR MAG GIU LUG AGO SET OTT NOV DIC)],
    fr => ['JANV','FÉVR','MARS','AVR','MAI','JUIN','JUIL','AOÛT','SEPT','OCT','NOV','DÉC'],
    de => ['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'],
    ja => [map { "${_}月" } 1 .. 12],
    pt => [qw(JAN FEV MAR ABR MAI JUN JUL AGO SET OUT NOV DEZ)],
);
my %DOW = (   # 0 = domingo
    es => [qw(DOM LUN MAR MIÉ JUE VIE SÁB)], en => [qw(SUN MON TUE WED THU FRI SAT)],
    it => [qw(DOM LUN MAR MER GIO VEN SAB)], fr => [qw(DIM LUN MAR MER JEU VEN SAM)],
    de => [qw(SO MO DI MI DO FR SA)],        ja => [qw(日 月 火 水 木 金 土)],
    pt => [qw(DOM SEG TER QUA QUI SEX SÁB)],
);
my %L_MAP = (es=>'Cómo llegar', en=>'Directions', it=>'Indicazioni', fr=>'Itinéraire', de=>'Anfahrt',
             ja=>'地図で見る', pt=>'Como chegar');
my %L_CAL = (es=>'+ CALENDARIO', en=>'+ CALENDAR', it=>'+ CALENDARIO', fr=>'+ AGENDA', de=>'+ KALENDER',
             ja=>'+ カレンダー', pt=>'+ CALENDÁRIO');
my %L_SUB = (es=>'Suscribite a nuestras fechas en tu calendario', en=>'Subscribe to our dates in your calendar',
             it=>'Iscriviti alle nostre date nel tuo calendario', fr=>'Abonnez-vous à nos dates dans votre agenda',
             de=>'Abonniere unsere Termine in deinem Kalender', ja=>'公演日をカレンダーで購読する',
             pt=>'Assine as nossas datas no seu calendário');
my $ICS_URL = 'webcal://www.orquestainvisible.musica.ar/fechas.ics';

sub urlenc { my $s = encode('UTF-8', shift // ''); $s =~ s/([^A-Za-z0-9\-_.~])/sprintf('%%%02X', ord($1))/ge; return $s; }
sub start_epoch { my $e = shift; my $d = $e->{date}; return timegm(0, $e->{min}, $e->{time}, $d->{d}, $d->{m} - 1, $d->{y}); }
sub end_epoch {
    my $e = shift; my $s = start_epoch($e);
    if (defined $e->{end_h}) {
        my $d = $e->{date};
        my $en = timegm(0, $e->{end_m}, $e->{end_h}, $d->{d}, $d->{m} - 1, $d->{y});
        $en += 86400 if $en <= $s;
        return $en;
    }
    return $s + 7200;     # sin hora de cierre: se asumen 2 horas (solo para el calendario)
}
sub fmt_naive { my @t = gmtime(shift); return sprintf('%04d%02d%02dT%02d%02d%02d', $t[5] + 1900, $t[4] + 1, $t[3], $t[2], $t[1], $t[0]); }
sub fmt_day   { my @t = gmtime(shift); return sprintf('%04d%02d%02d', $t[5] + 1900, $t[4] + 1, $t[3]); }
sub day_epoch { my $e = shift; my $d = $e->{date}; return timegm(0, 0, 12, $d->{d}, $d->{m} - 1, $d->{y}); }
sub es_location {
    my $e = shift;
    my @p = ($e->{lugar}); push @p, $e->{calle} if length $e->{calle};
    push @p, (norm($e->{ciudad}) eq 'caba' ? 'Buenos Aires' : $e->{ciudad});
    return join(', ', @p);
}
sub gcal_link {
    my $e = shift;
    my $dates; my $ctz = '';
    if (defined $e->{time}) {
        $dates = fmt_naive(start_epoch($e)) . '/' . fmt_naive(end_epoch($e));
        $ctz = '&ctz=America/Argentina/Buenos_Aires' if $e->{pais} eq 'AR';
    } else {
        $dates = fmt_day(day_epoch($e)) . '/' . fmt_day(day_epoch($e) + 86400);
    }
    my $details = length $e->{link} ? $e->{link} : "$BASE/agenda.html";
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        . '&text=' . urlenc("Orquesta Invisible – $e->{nombre}") . '&dates=' . $dates . $ctz
        . '&location=' . urlenc(es_location($e)) . '&details=' . urlenc($details);
}
sub agenda_item_html {
    my ($lang, $e) = @_;
    my $d = $e->{date};
    my @w = gmtime(day_epoch($e));
    my $mes = $MON{$lang}[$d->{m} - 1];
    if ($d->{y} != $today_year) { $mes = $lang eq 'ja' ? "$d->{y}年$mes" : "$mes $d->{y}"; }
    my $addr = join(', ', grep { length } ($e->{calle}, city_display($lang, $e)));
    my $map = 'https://www.google.com/maps/search/?api=1&query=' . urlenc(es_location($e));
    my @meta;
    push @meta, '<span class="agenda-hora">' . he(tfmt($lang, $e->{time}, $e->{min})) . '</span>' if defined $e->{time};
    push @meta, '<span class="agenda-lugar">' . he($e->{lugar}) . '</span>' if norm($e->{lugar}) ne norm($e->{nombre});
    my $meta = join(' ', @meta);
    my $btn = '';
    if ($e->{boton} eq 'reservar') {
        $btn = sprintf('<a href="%s" target="_blank" rel="noopener" class="btn-ticket">%s</a>', he($e->{link}), $BOOK{$lang});
    } elsif (length $e->{link}) {
        $btn = sprintf('<a href="%s" target="_blank" rel="noopener" class="btn-ticket">+INFO</a>', he($e->{link}));
    }
    my $cal = sprintf('<a href="%s" target="_blank" rel="noopener" class="agenda-cal">%s</a>', he(gcal_link($e)), $L_CAL{$lang});
    return "            <article class=\"agenda-item\">\n"
         . "                <div class=\"agenda-fecha\"><span class=\"agenda-dia\">" . $d->{d} . "</span><span class=\"agenda-mes\">" . he($mes) . "</span><span class=\"agenda-dow\">" . $DOW{$lang}[$w[6]] . "</span></div>\n"
         . "                <div class=\"agenda-detalle\">\n"
         . "                    <h3 class=\"agenda-titulo\">" . he($e->{nombre}) . "</h3>\n"
         . (length $meta ? "                    <p class=\"agenda-meta\">$meta</p>\n" : '')
         . "                    <p class=\"agenda-meta agenda-dir\">" . he($addr) . " &middot; <a href=\"" . he($map) . "\" target=\"_blank\" rel=\"noopener\">" . he($L_MAP{$lang}) . " &#8599;</a></p>\n"
         . "                </div>\n"
         . "                <div class=\"agenda-acciones\">" . join(' ', grep { length } ($btn, $cal)) . "</div>\n"
         . "            </article>\n";
}
sub agenda_block {
    my ($lang) = @_;
    my $b = "<!-- AGENDA:INICIO (generado desde la planilla de fechas; no editar a mano) -->\n"
          . "        <div class=\"agenda-lista\">\n";
    if (!@events) { $b .= "            <p class=\"agenda-vacia\">" . he($EMPTY{$lang}) . "</p>\n"; }
    else          { $b .= agenda_item_html($lang, $_) for @events; }
    $b .= "        </div>\n"
        . "        <p class=\"agenda-suscribir\"><a href=\"$ICS_URL\"><i class=\"fa-regular fa-calendar-plus\"></i> " . he($L_SUB{$lang}) . "</a></p>\n"
        . "        <!-- AGENDA:FIN -->";
    return $b;
}
sub ics_escape { my $s = shift // ''; $s =~ s/\\/\\\\/g; $s =~ s/;/\\;/g; $s =~ s/,/\\,/g; $s =~ s/\r?\n/\\n/g; return $s; }
sub ics_fold {
    my $line = shift; my $out = ''; my $cur = ''; my $limit = 74;
    for my $ch (split //, $line) {
        if (length(encode('UTF-8', $cur . $ch)) > $limit) { $out .= $cur . "\r\n "; $cur = $ch; $limit = 73; }
        else { $cur .= $ch; }
    }
    return $out . $cur;
}
sub ics_file {
    my @l = ('BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Orquesta Invisible//Fechas//ES', 'CALSCALE:GREGORIAN',
             'METHOD:PUBLISH', 'X-WR-CALNAME:Orquesta Invisible – Fechas', 'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
             'X-WR-CALDESC:Próximas fechas de la Orquesta Invisible');
    for my $e (@events) {
        my $uid = sprintf('%s-%s@orquestainvisible.musica.ar', fmt_day(day_epoch($e)), lc(do { my $n = norm($e->{nombre}); $n =~ s/[^a-z0-9]+/-/g; $n =~ s/^-|-$//g; $n }));
        push @l, 'BEGIN:VEVENT', "UID:$uid", 'DTSTAMP:20260101T000000Z';
        if (defined $e->{time}) {
            my ($s, $en) = (start_epoch($e), end_epoch($e));
            if ($e->{pais} eq 'AR') { push @l, 'DTSTART:' . fmt_naive($s + 10800) . 'Z', 'DTEND:' . fmt_naive($en + 10800) . 'Z'; }
            else                    { push @l, 'DTSTART:' . fmt_naive($s), 'DTEND:' . fmt_naive($en); }
        } else {
            push @l, 'DTSTART;VALUE=DATE:' . fmt_day(day_epoch($e)), 'DTEND;VALUE=DATE:' . fmt_day(day_epoch($e) + 86400);
        }
        push @l, 'SUMMARY:' . ics_escape("Orquesta Invisible – $e->{nombre}"),
                 'LOCATION:' . ics_escape(es_location($e)),
                 'URL:' . (length $e->{link} ? $e->{link} : "$BASE/agenda.html"),
                 'DESCRIPTION:' . ics_escape((length $e->{link} ? ($e->{boton} eq 'reservar' ? 'Entradas: ' : 'Más info: ') . $e->{link} : "Más info: $BASE/agenda.html")),
                 'END:VEVENT';
    }
    push @l, 'END:VCALENDAR';
    return join("\r\n", map { ics_fold($_) } @l) . "\r\n";
}

# ---------- reescribir los 7 index.html ----------
my %new;
for my $lang (@LANGS) {
    my $f = "$root/$FILE{$lang}";
    open my $fh, '<:raw', $f or fail("no pude abrir $f: $!");
    my $html = decode('UTF-8', do { local $/; <$fh> }); close $fh;
    $html =~ s/\r\n/\n/g;
    my $orig = $html;

    # 1) filas
    $html =~ m{<section id="conciertos"[^>]*>\s*<h2[^>]*>.*?</h2>(.*?)</section>}s or fail("no encontré la sección #conciertos en $f");
    my $mid = $1;
    my ($more) = $mid =~ /data-more="([^"]*)"/;
    my ($less) = $mid =~ /data-less="([^"]*)"/;
    my ($btn)  = $mid =~ m{<button[^>]*>\s*(.*?)\s*</button>}s;
    fail("no encontré el botón 'ver todas las fechas' en $f") unless defined $more && defined $less && defined $btn;
    my $gen = "\n\n        <!-- FECHAS:INICIO (generado desde la planilla de fechas; no editar a mano) -->\n";
    if (!@events) {
        $gen .= "        <p class=\"show-empty\" style=\"text-align:center; opacity:.7;\">" . he($EMPTY{$lang}) . "</p>\n";
    } else {
        my $n_vis = @events < $VISIBLES ? scalar(@events) : $VISIBLES;
        my @rest = @events[$n_vis .. $#events];
        $gen .= row_html($lang, $events[$_], 8) for 0 .. $n_vis - 1;
        if (@rest) {
            $gen .= "\n        <div id=\"extra-shows\" style=\"display: none;\">\n";
            $gen .= row_html($lang, $_, 12) for @rest;
            $gen .= "        </div>\n\n";
            $gen .= "        <div class=\"show-action reveal\" style=\"text-align: center; margin-top: 30px;\">\n";
            $gen .= "            <button id=\"btn-toggle-shows\" class=\"btn-ticket\" style=\"cursor: pointer; background: transparent;\" data-more=\"$more\" data-less=\"$less\">\n";
            $gen .= "                $btn\n            </button>\n        </div>\n";
        }
    }
    $gen .= "        <!-- FECHAS:FIN -->\n\n    ";
    $html =~ s{(<section id="conciertos"[^>]*>\s*<h2[^>]*>.*?</h2>)(.*?)(</section>)}{$1$gen$3}s;

    # 2) JSON-LD de eventos
    my $blk = schema_block($lang);
    $html =~ s{[ \t]*<!-- SEO-BOOST: eventos -->\n\s*<script type="application/ld\+json">\n.*?\n\s*</script>}{$blk}s
        or fail("no encontré el bloque de eventos (SEO-BOOST: eventos) en $f");

    # 3) bio en español
    if ($lang eq 'es') {
        my $s = bio_sentence();
        $html =~ s/Próxima fecha: [^.\n<]*\./$s/ or fail("no encontré la frase 'Próxima fecha' en la bio de $f");
    }
    $new{$lang} = [$f, $html, $orig, $FILE{$lang}];
}

# ---------- páginas de agenda (agenda.html de cada idioma) ----------
for my $lang (@LANGS) {
    my $f = "$root/$AGENDA{$lang}";
    open my $fh, '<:raw', $f or fail("no pude abrir $f: $!");
    my $html = decode('UTF-8', do { local $/; <$fh> }); close $fh;
    $html =~ s/\r\n/\n/g;
    my $orig = $html;

    my $blk = agenda_block($lang);
    $html =~ s{<!-- AGENDA:INICIO.*?<!-- AGENDA:FIN -->}{$blk}s
        or fail("no encontré la zona AGENDA (AGENDA:INICIO / AGENDA:FIN) en $f");
    # datos para Google (Event) también en la agenda
    my $ld = schema_block($lang);
    unless ($html =~ s{[ \t]*<!-- SEO-BOOST: eventos -->\n\s*<script type="application/ld\+json">\n.*?\n\s*</script>}{$ld}s) {
        $html =~ s{\n</head>}{\n\n$ld\n</head>} or fail("no encontré </head> en $f");
    }
    $html =~ s{agenda\.css\?v=\d+}{agenda.css?v=$AGENDA_CSS_V}g;
    $new{"agenda-$lang"} = [$f, $html, $orig, $AGENDA{$lang}];
}

# ---------- fechas.ics ----------
{
    my $f = "$root/fechas.ics";
    my $ics = ics_file();
    my $orig = '';
    if (-e $f) { open my $fh, '<:raw', $f or fail("no pude abrir $f: $!"); $orig = decode('UTF-8', do { local $/; <$fh> }); close $fh; }
    $new{'ics'} = [$f, $ics, $orig, 'fechas.ics'];
}

my $changed = 0;
for my $k ((map { $_ } @LANGS), (map { "agenda-$_" } @LANGS), 'ics') {
    my ($f, $html, $orig, $label) = @{$new{$k}};
    if ($html eq $orig) { print "sin cambios: $label\n"; next; }
    open my $out, '>:raw', $f or fail("no pude escribir $f: $!");
    print $out encode('UTF-8', $html); close $out;
    print "actualizado: $label\n"; $changed++;
}
print scalar(@events) . " fecha(s) próxima(s); $changed archivo(s) actualizado(s).\n";
