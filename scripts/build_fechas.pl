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
my %HOME   = (es=>"$BASE/", en=>"$BASE/en/", it=>"$BASE/it/", fr=>"$BASE/fr/", de=>"$BASE/de/", ja=>"$BASE/ja/", pt=>"$BASE/pt/");
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
    # Botón: lo elige la persona en el menú. "Reservar" = RESERVAR (link de entradas), "Más info" = +INFO
    # (página del evento). Vacío = esa fecha NO muestra botón (no hay nada automático).
    my $b = norm($cell->('boton'));
    if    ($b eq '')                                            { $e{boton} = ''; }
    elsif ($b =~ /^(reservar|reserva|entradas|tickets?)$/)      { $e{boton} = 'reservar'; }
    elsif ($b =~ /^(mas info|mas informacion|info|informacion)$/) { $e{boton} = 'info'; }
    else { push @errors, "fila $line: el Botón \"" . $cell->('boton') . "\" debe ser Reservar o Más info"; next; }
    push @errors, "fila $line: elegiste el botón \"" . $cell->('boton') . "\" pero falta el Link" if length $e{boton} && !length $e{link};
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
    my $btn = $e->{boton} eq 'reservar' ? sprintf('<a href="%s" target="_blank" class="btn-ticket">%s</a>', he($e->{link}), $BOOK{$lang})
            : $e->{boton} eq 'info'     ? sprintf('<a href="%s" target="_blank" class="btn-ticket">+INFO</a>', he($e->{link}))
            :                             '';   # sin botón elegido: no se muestra ninguno
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
        my $url = length $e->{link} ? $e->{link} : $HOME{$lang};
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

my $changed = 0;
for my $k (@LANGS) {
    my ($f, $html, $orig, $label) = @{$new{$k}};
    if ($html eq $orig) { print "sin cambios: $label\n"; next; }
    open my $out, '>:raw', $f or fail("no pude escribir $f: $!");
    print $out encode('UTF-8', $html); close $out;
    print "actualizado: $label\n"; $changed++;
}
print scalar(@events) . " fecha(s) próxima(s); $changed archivo(s) actualizado(s).\n";
