<?php

declare(strict_types=1);

require_once __DIR__ . '/fpdf/fpdf.php';

function alokPdfText(mixed $s): string
{
    $s = (string) $s;
    $s = strtr($s, [
        "\u{20B9}" => 'Rs.', "\u{2013}" => '-', "\u{2014}" => '-', "\u{2018}" => "'", "\u{2019}" => "'",
        "\u{201C}" => '"', "\u{201D}" => '"', "\u{00D7}" => 'x', "\u{2022}" => '*', "\u{2026}" => '...', "\u{00A0}" => ' ',
    ]);
    $out = @iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $s);
    if ($out === false) {
        $out = preg_replace('/[^\x20-\x7E]/', '', $s) ?? '';
    }
    return $out;
}

function alokRs(float $n): string
{
    return 'Rs. ' . number_format($n, 2, '.', ',');
}

function alokProformaPdf(array $d): string
{
    $items = is_array($d['items'] ?? null) ? $d['items'] : [];
    $customer = is_array($d['customer'] ?? null) ? $d['customer'] : [];

    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->SetTitle('Proforma Invoice');
    $pdf->SetAuthor('Alok Plastics');
    $pdf->SetCreator('Alok Plastics');
    $pdf->SetMargins(15, 15, 15);
    $pdf->SetAutoPageBreak(true, 22);
    $pdf->AddPage();

    $left = 15;
    $right = 195;
    $brandDir = dirname(__DIR__, 2) . '/brand/';
    $brand = '';
    foreach (['alok-logo-primary-512.png', 'alok-logo-primary.png'] as $b) {
        if (is_file($brandDir . $b)) {
            $brand = $brandDir . $b;
            break;
        }
    }
    if ($brand !== '') {
        $pdf->Image($brand, $left, 14, 30);
        $pdf->SetY(44);
    } else {
        $pdf->SetY(16);
    }

    $pdf->SetXY($left, $pdf->GetY());
    $pdf->SetFont('Helvetica', 'B', 15);
    $pdf->SetTextColor(20, 20, 20);
    $pdf->Cell(110, 7, alokPdfText('Alok Plastics'), 0, 2, 'L');
    $pdf->SetFont('Helvetica', '', 8.5);
    $pdf->SetTextColor(90, 90, 90);
    $pdf->Cell(110, 4.5, alokPdfText('Plot No-06, Industrial Area Phase II, Ram Darbar'), 0, 2, 'L');
    $pdf->Cell(110, 4.5, alokPdfText('Chandigarh 160003, India'), 0, 2, 'L');
    $pdf->Cell(110, 4.5, alokPdfText('Phone: +91 74794 97003'), 0, 2, 'L');
    $pdf->Cell(110, 4.5, alokPdfText('Email: alokplastics24@gmail.com'), 0, 2, 'L');

    $pdf->SetXY(120, 16);
    $pdf->SetFont('Helvetica', 'B', 17);
    $pdf->SetTextColor(120, 20, 40);
    $pdf->Cell(75, 8, alokPdfText('PROFORMA'), 0, 2, 'R');
    $pdf->Cell(75, 8, alokPdfText('INVOICE'), 0, 2, 'R');
    $pdf->SetFont('Helvetica', '', 9);
    $pdf->SetTextColor(70, 70, 70);
    $pdf->Cell(75, 5, alokPdfText('No: ' . (string) ($d['no'] ?? '')), 0, 2, 'R');
    $pdf->Cell(75, 5, alokPdfText('Date: ' . (string) ($d['date'] ?? '')), 0, 2, 'R');

    $y = max($pdf->GetY(), 60) + 4;
    $pdf->SetDrawColor(210, 210, 210);
    $pdf->Line($left, $y, $right, $y);
    $y += 6;

    $pdf->SetXY($left, $y);
    $pdf->SetFont('Helvetica', 'B', 9.5);
    $pdf->SetTextColor(30, 30, 30);
    $pdf->Cell(90, 5, alokPdfText('Bill To'), 0, 2, 'L');
    $pdf->SetFont('Helvetica', '', 9.5);
    $pdf->Cell(120, 5.5, alokPdfText((string) ($customer['name'] ?? 'Customer')), 0, 2, 'L');
    if (($customer['phone'] ?? '') !== '') {
        $pdf->Cell(120, 5.5, alokPdfText((string) $customer['phone']), 0, 2, 'L');
    }
    if (($customer['address'] ?? '') !== '') {
        $pdf->MultiCell(120, 5.5, alokPdfText((string) $customer['address']), 0, 'L');
    }
    $pdf->Ln(3);

    $w = [10, 80, 20, 20, 25, 25];
    $head = ['#', 'Description', 'Qty', 'Unit', 'Unit Price', 'Amount'];
    $align = ['C', 'L', 'C', 'C', 'R', 'R'];
    $pdf->SetFont('Helvetica', 'B', 9);
    $pdf->SetFillColor(238, 232, 234);
    $pdf->SetTextColor(30, 30, 30);
    foreach ($head as $i => $h) {
        $pdf->Cell($w[$i], 8, alokPdfText($h), 1, 0, $align[$i], true);
    }
    $pdf->Ln();

    $pdf->SetFont('Helvetica', '', 9);
    $allPriced = $items !== [];
    $total = 0.0;
    $n = 0;
    foreach ($items as $it) {
        if (!is_array($it)) {
            continue;
        }
        $n++;
        $name = alokPdfText(mb_substr((string) ($it['name'] ?? ''), 0, 58));
        $qty = (int) ($it['qty'] ?? 0);
        $unit = alokPdfText((string) ($it['unit'] ?? 'pcs'));
        $price = $it['price'] ?? null;
        if ($price === null || !is_numeric($price)) {
            $allPriced = false;
            $priceTxt = '-';
            $amtTxt = 'On request';
        } else {
            $price = (float) $price;
            $total += $price * $qty;
            $priceTxt = alokRs($price);
            $amtTxt = alokRs($price * $qty);
        }
        $pdf->Cell($w[0], 7.5, (string) $n, 1, 0, 'C');
        $pdf->Cell($w[1], 7.5, $name, 1, 0, 'L');
        $pdf->Cell($w[2], 7.5, (string) $qty, 1, 0, 'C');
        $pdf->Cell($w[3], 7.5, $unit, 1, 0, 'C');
        $pdf->Cell($w[4], 7.5, $priceTxt, 1, 0, 'R');
        $pdf->Cell($w[5], 7.5, $amtTxt, 1, 0, 'R');
        $pdf->Ln();
    }
    if ($items === []) {
        $pdf->Cell(array_sum($w), 7.5, alokPdfText('No items'), 1, 0, 'C');
        $pdf->Ln();
    }

    $pdf->SetFont('Helvetica', 'B', 9.5);
    $pdf->Cell($w[0] + $w[1] + $w[2] + $w[3] + $w[4], 8, alokPdfText('Total'), 1, 0, 'R', true);
    $pdf->Cell($w[5], 8, alokPdfText($allPriced ? alokRs($total) : 'Price on request'), 1, 0, 'R', true);
    $pdf->Ln(12);

    if (($d['note'] ?? '') !== '') {
        $pdf->SetFont('Helvetica', '', 9);
        $pdf->SetTextColor(60, 60, 60);
        $pdf->MultiCell(0, 5, alokPdfText('Note: ' . (string) $d['note']), 0, 'L');
        $pdf->Ln(2);
    }

    $pdf->SetFont('Helvetica', 'I', 8.5);
    $pdf->SetTextColor(120, 120, 120);
    $pdf->MultiCell(0, 4.5, alokPdfText('This is a proforma invoice, not a tax invoice. Final price, stock and delivery are confirmed by Alok Plastics.'), 0, 'L');
    $pdf->Ln(1);
    $pdf->SetFont('Helvetica', 'B', 9);
    $pdf->SetTextColor(120, 20, 40);
    $pdf->MultiCell(0, 5, alokPdfText('For more information, please contact us: +91 74794 97003 (WhatsApp).'), 0, 'L');

    return $pdf->Output('S');
}

function alokBusiness(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $defaults = [
        'name' => 'ALOK PLASTICS',
        'gstin' => '04AATHPK8119J1ZK',
        'tagline' => ['Specialist in :', 'All Type of Plastic, L.D.P, H.H.P.S., A.B.S., Nilon, Rubber, Plastic Molding etc.'],
        'address' => ['Plot No. 6, Industrial Area, Phase-II, Chandigarh-160002'],
        'phones' => ['9915745414', '7888990913'],
        'bank' => ['BANK DETAIL', 'PUNJAB NATIONAL BANK, Industrial Area, Ph-2, CHD.', 'Account No. : 3247002100146400', 'IFSC Code : PUNB0324700'],
        'terms' => [
            '1. All disputes subject to Chandigarh Jurisdiction only.',
            '2. Interest @ 18% p.a. will be charged if the bill is not paid within 30 days.',
            '3. Goods once sold will not be taken back.',
        ],
        'copies' => 'White : Original | Pink : Duplicate | Yellow : Triplicate',
        'proforma_note' => 'This is a proforma invoice, not a tax invoice. Final price, stock and delivery are confirmed by Alok Plastics.',
        'state' => 'Chandigarh',
        'upiqr' => 'brand/upiqr.png',
    ];
    $cfg = class_exists('AlokShop') ? AlokShop::cfg('ALOK_BUSINESS') : null;
    $b = is_array($cfg) ? array_replace($defaults, $cfg) : $defaults;
    foreach (['tagline', 'address', 'phones', 'bank', 'terms'] as $k) {
        $b[$k] = array_values(array_map('strval', (array) $b[$k]));
    }
    return $cache = $b;
}

function alokFinancialYear(): string
{
    $now = new DateTimeImmutable('now', AlokShop::tz());
    $start = (int) $now->format('n') >= 4 ? (int) $now->format('Y') : (int) $now->format('Y') - 1;
    return $start . '-' . substr((string) ($start + 1), 2);
}

function alokSeqNo(string $fileName, string $prefix): string
{
    $fy = alokFinancialYear();
    $file = AlokConfig::dataDir() . '/' . $fileName;
    $n = (int) AlokFs::withLock($file . '.lock', static function () use ($file, $fy): int {
        $d = AlokFs::readJson($file) ?? [];
        $d[$fy] = (int) ($d[$fy] ?? 0) + 1;
        AlokFs::atomicWrite($file, json_encode($d));
        @chmod($file, 0640);
        return $d[$fy];
    });
    return $prefix . $fy . '/' . str_pad((string) $n, 4, '0', STR_PAD_LEFT);
}

function alokProformaNo(): string
{
    return alokSeqNo('proforma-seq.json', 'AP/PF/');
}

function alokInvoiceNo(): string
{
    return alokSeqNo('invoice-seq.json', 'AP/INV/');
}

function alokPhoneDisplay(string $raw): string
{
    $d = preg_replace('/\D/', '', $raw) ?? '';
    if (strlen($d) === 12 && str_starts_with($d, '91')) {
        $d = substr($d, 2);
    }
    return strlen($d) === 10 ? '+91 ' . substr($d, 0, 5) . ' ' . substr($d, 5) : ($d !== '' ? '+' . $d : '');
}

/** "+91 99157 45414 / +91 78889 90913 (WhatsApp +91 74794 97003)" from the business settings. */
function alokContactLine(): string
{
    $line = implode(' / ', array_map('alokPhoneDisplay', alokBusiness()['phones']));
    $wa = alokPhoneDisplay(AlokShop::waNumber());
    return $wa !== '' ? $line . ' (WhatsApp ' . $wa . ')' : $line;
}

function alokDocCaption(string $type, string $no, string $name = '', string $code = ''): string
{
    $doc = $type === 'invoice' ? 'GST Invoice' : 'Proforma Invoice';
    $first = explode(' ', trim($name))[0];
    return ($first !== '' ? "Hello {$first}, " : '') . "please find your {$doc} {$no} attached" . ($code !== '' ? " for enquiry {$code}" : '') . ".\n"
        . 'For more information, contact us: ' . alokContactLine() . ".\n- Alok Plastics";
}

function alokInr(float $n): string
{
    [$int, $dec] = explode('.', number_format(abs($n), 2, '.', ''));
    if (strlen($int) > 3) {
        $int = preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', substr($int, 0, -3)) . ',' . substr($int, -3);
    }
    return ($n < 0 ? '-' : '') . $int . '.' . $dec;
}

function alokRupeesInWords(int $n): string
{
    if ($n <= 0) {
        return '';
    }
    $a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    $b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    $two = static fn(int $x): string => $x < 20 ? $a[$x] : $b[intdiv($x, 10)] . ($x % 10 ? ' ' . $a[$x % 10] : '');
    $three = static fn(int $x): string => ($x > 99 ? $a[intdiv($x, 100)] . ' Hundred' . ($x % 100 ? ' ' : '') : '') . ($x % 100 ? $two($x % 100) : '');
    $s = '';
    foreach ([[10000000, 'Crore'], [100000, 'Lakh'], [1000, 'Thousand']] as [$v, $label]) {
        $q = intdiv($n, $v);
        if ($q > 0) {
            $s .= ($q > 99 ? $three($q) : $two($q)) . ' ' . $label . ' ';
            $n %= $v;
        }
    }
    if ($n > 0) {
        $s .= $three($n) . ' ';
    }
    return trim($s) . ' Rupees Only';
}

/** @return array{sub:float,taxes:list<array{0:string,1:float}>,raw:float,grand:int,round:float,priced:bool,rate:float,mode:string} */
function alokInvoiceTotals(array $d, bool $withTax): array
{
    $sub = 0.0;
    $priced = true;
    $count = 0;
    foreach ((array) ($d['items'] ?? []) as $it) {
        if (!is_array($it)) {
            continue;
        }
        $count++;
        if (!isset($it['price']) || !is_numeric($it['price'])) {
            $priced = false;
            continue;
        }
        $sub += (float) $it['price'] * (float) ($it['qty'] ?? 0);
    }
    $sub = round($sub, 2);
    $mode = in_array($d['mode'] ?? '', ['intra', 'inter', 'ut'], true) ? (string) $d['mode'] : 'ut';
    $rate = max(0.0, (float) ($d['rate'] ?? 18));
    $taxes = [];
    if ($withTax) {
        if ($mode === 'inter') {
            $taxes[] = ['Add IGST', round($sub * $rate / 100, 2)];
        } else {
            $half = round($sub * $rate / 200, 2);
            $taxes[] = [$mode === 'intra' ? 'Add SGST' : 'Add UTGST', $half];
            $taxes[] = ['Add CGST', $half];
        }
    }
    $raw = $sub;
    foreach ($taxes as $t) {
        $raw += $t[1];
    }
    $grand = (int) round($raw);
    return ['sub' => $sub, 'taxes' => $taxes, 'raw' => $raw, 'grand' => $grand, 'round' => $grand - $raw, 'priced' => $priced && $count > 0, 'rate' => $rate, 'mode' => $mode];
}

final class AlokInvoiceDoc extends FPDF
{
    public const OX = 6.0;
    public const OY = 6.0;
    public const SX = 198.0 / 759.0;
    public const SY = 285.0 / 1039.0;

    public function __construct()
    {
        parent::__construct('P', 'mm', 'A4');
        $this->cMargin = 0;
        $this->SetMargins(0, 0, 0);
        $this->SetAutoPageBreak(false);
        $this->SetLineWidth(0.38);
    }

    public function px(float $x): float
    {
        return self::OX + $x * self::SX;
    }

    public function py(float $y): float
    {
        return self::OY + $y * self::SY;
    }

    public function pw(float $w): float
    {
        return $w * self::SX;
    }

    public function ph(float $h): float
    {
        return $h * self::SY;
    }

    public function pt(float $sizePx): float
    {
        return $sizePx * self::SX * 2.835;
    }

    public function dash(bool $on): void
    {
        $this->_out($on ? '[0.35 0.7] 0 d' : '[] 0 d');
    }

    public function vline(float $x, float $y1, float $y2): void
    {
        $this->Line($this->px($x), $this->py($y1), $this->px($x), $this->py($y2));
    }

    public function hline(float $x1, float $x2, float $y): void
    {
        $this->Line($this->px($x1), $this->py($y), $this->px($x2), $this->py($y));
    }

    public function dotted(float $x1, float $x2, float $y): void
    {
        $this->dash(true);
        $this->SetLineWidth(0.2);
        $this->hline($x1, $x2, $y);
        $this->SetLineWidth(0.38);
        $this->dash(false);
    }

    public function fitSize(string $text, float $wMm, float $sizePt, string $family, string $style, float $minPt = 6.0): float
    {
        $this->SetFont($family, $style, $sizePt);
        while ($sizePt > $minPt && $this->GetStringWidth($text) > $wMm) {
            $sizePt -= 0.25;
            $this->SetFont($family, $style, $sizePt);
        }
        return $sizePt;
    }

    public function put(float $x, float $y, float $w, float $h, string $text, float $sizePx, string $style = '', string $align = 'L', string $family = 'Helvetica'): void
    {
        $text = alokPdfText($text);
        $this->fitSize($text, $this->pw($w), $this->pt($sizePx), $family, $style);
        $this->SetXY($this->px($x), $this->py($y));
        $this->Cell($this->pw($w), $this->ph($h), $text, 0, 0, $align);
    }

    /** Greedy word wrap with the current font; $text must already be Latin-1 safe. @return list<string> */
    public function wrap(string $text, float $wMm, int $maxLines = 0): array
    {
        $lines = [];
        $cur = '';
        foreach (preg_split('/\s+/', trim($text)) ?: [] as $word) {
            if ($word === '') {
                continue;
            }
            $try = $cur === '' ? $word : $cur . ' ' . $word;
            if ($this->GetStringWidth($try) <= $wMm) {
                $cur = $try;
                continue;
            }
            if ($cur !== '') {
                $lines[] = $cur;
            }
            $cur = $word;
            while ($this->GetStringWidth($cur) > $wMm && strlen($cur) > 1) {
                $cut = strlen($cur) - 1;
                while ($cut > 1 && $this->GetStringWidth(substr($cur, 0, $cut)) > $wMm) {
                    $cut--;
                }
                $lines[] = substr($cur, 0, $cut);
                $cur = substr($cur, $cut);
            }
        }
        if ($cur !== '') {
            $lines[] = $cur;
        }
        return $maxLines > 0 ? array_slice($lines, 0, $maxLines) : $lines;
    }
}

function alokInvoiceFrame(AlokInvoiceDoc $p, array $b, array $d, bool $isInvoice): void
{
    $cust = is_array($d['customer'] ?? null) ? $d['customer'] : [];
    $tr = is_array($d['transport'] ?? null) ? $d['transport'] : [];
    $p->SetDrawColor(0, 0, 0);
    $p->SetTextColor(0, 0, 0);
    $p->SetLineWidth(0.38);
    $p->Rect($p->px(0), $p->py(0), $p->pw(759), $p->ph(1039));

    if ($isInvoice) {
        $p->put(14, 11, 220, 20, 'GSTIN : ' . (string) $b['gstin'], 14, 'B');
    }
    $title = $isInvoice ? 'GST INVOICE' : 'PROFORMA INVOICE';
    $p->put(0, 9, 759, 24, $title, 17, 'B', 'C');
    $tw = $p->GetStringWidth($title);
    $p->Line($p->px(759 / 2) - $tw / 2, $p->py(31), $p->px(759 / 2) + $tw / 2, $p->py(31));

    $p->SetLineWidth(0.3);
    $p->Rect($p->px(631), $p->py(12), $p->pw(13), $p->ph(23));
    $p->Rect($p->px(634), $p->py(16), $p->pw(7), $p->ph(8));
    $p->Line($p->px(634), $p->py(27), $p->px(641), $p->py(27));
    $p->Line($p->px(634), $p->py(30), $p->px(641), $p->py(30));
    $p->SetLineWidth(0.38);
    foreach (array_slice($b['phones'], 0, 2) as $i => $ph) {
        $p->put(651, 9 + $i * 21, 108, 21, (string) $ph, 18);
    }

    $name = (string) $b['name'];
    $p->put(0, 36, 759, 62, $name, 52, 'B', 'C', 'Helvetica');
    foreach (array_slice($b['tagline'], 0, 2) as $i => $line) {
        $p->put(0, 96 + $i * 16, 759, 20, (string) $line, 16, '', 'C');
    }
    $p->put(0, 133, 759, 24, implode(', ', $b['address']), 19, 'B', 'C');

    $p->put(16, 169, 50, 22, 'Date :', 15);
    $p->put(62, 169, 136, 22, (string) ($d['date'] ?? ''), 15);
    $p->dotted(62, 198, 191);

    $no = alokPdfText((string) ($d['no'] ?? ''));
    $p->SetFont('Helvetica', 'B', $p->pt(22));
    $nw = min(330.0, $p->GetStringWidth($no) / AlokInvoiceDoc::SX + 4);
    $p->put(750 - $nw - 100, 172, 100, 24, $isInvoice ? 'Invoice No. :' : 'Proforma No. :', 15, '', 'R');
    $p->put(750 - $nw, 170, $nw, 28, $no, 22, 'B', 'R', 'Helvetica');

    $p->put(16, 206, 40, 24, 'M/s.', 15);
    $mob = preg_replace('/^\+?91(?=\d{10}$)/', '', trim((string) ($cust['phone'] ?? ''))) ?? '';
    $p->put(50, 204, $mob !== '' ? 520 : 690, 24, (string) ($cust['name'] ?? ''), 15, 'B');
    if ($mob !== '') {
        $p->put(580, 206, 163, 22, 'Mob. : ' . $mob, 14, '', 'R');
    }
    $p->dotted(50, 743, 229);

    $p->SetFont('Helvetica', '', $p->pt(14));
    foreach ($p->wrap(alokPdfText((string) ($cust['address'] ?? '')), $p->pw(720), 2) as $i => $line) {
        $p->put(16, 233 + $i * 15, 727, 15, $line, 14);
    }
    $p->dotted(16, 743, 262);

    $gstin = strtoupper(trim((string) ($cust['gstin'] ?? '')));
    $state = trim((string) ($cust['state'] ?? ''));
    $code = trim((string) ($cust['state_code'] ?? ''));
    if ($code === '' && preg_match('/^\d{2}/', $gstin) === 1) {
        $code = substr($gstin, 0, 2);
    }
    $p->put(16, 268, 100, 22, 'PARTY GSTIN', 15);
    $p->put(124, 268, 194, 22, $gstin, 14);
    $p->dotted(117, 318, 289);
    $p->put(326, 268, 44, 22, 'State', 15);
    $p->put(370, 268, 160, 22, $state, 14);
    $p->dotted(370, 530, 289);
    $p->put(536, 268, 80, 22, 'State Code', 15);
    $p->put(618, 268, 125, 22, $code, 14);
    $p->dotted(618, 743, 289);

    $p->put(16, 300, 74, 22, 'Transport', 15);
    $p->put(90, 300, 215, 22, (string) ($tr['transporter'] ?? ''), 14);
    $p->dotted(90, 305, 321);
    $p->put(312, 300, 70, 22, 'G.R. No.', 15);
    $p->put(382, 300, 170, 22, (string) ($tr['gr_no'] ?? ''), 14);
    $p->dotted(382, 556, 321);
    $p->put(562, 300, 28, 22, 'Dt.', 15);
    $p->put(590, 300, 153, 22, (string) ($tr['gr_dt'] ?? ''), 14);
    $p->dotted(590, 743, 321);

    $p->hline(0, 759, 329);
    foreach ([33, 438, 507, 565, 644] as $x) {
        $p->vline($x, 329, 777);
    }
    $p->hline(0, 759, 367);
    $p->put(0, 332, 33, 15, 'S.', 15, '', 'C');
    $p->put(0, 346, 33, 15, 'No.', 15, '', 'C');
    $p->put(33, 329, 405, 38, 'DESCRIPTION OF GOODS', 15, '', 'C');
    $p->put(438, 329, 69, 38, 'HSN ACS', 14, '', 'C');
    $p->put(507, 329, 58, 38, 'Qty.', 15, '', 'C');
    $p->put(565, 329, 79, 38, 'RATE', 15, '', 'C');
    $p->put(644, 329, 115, 38, 'AMOUNT', 15, '', 'C');

    $p->put(13, 937, 100, 16, 'E. & O. E.', 12, 'B');
    foreach (array_slice($b['terms'], 0, 3) as $i => $t) {
        $p->put(13, 953 + $i * 14.5, 440, 14.5, (string) $t, 12);
    }
    $p->SetFont('Helvetica', 'B', $p->pt(19));
    $nameW = $p->GetStringWidth(alokPdfText($name)) / AlokInvoiceDoc::SX;
    $p->put(750 - $nameW - 34, 966, 28, 28, 'For', 14, 'BI', 'R');
    $p->put(750 - $nameW - 2, 964, $nameW + 2, 30, $name, 19, 'B', 'R');
    $p->put(13, 1006, 360, 20, (string) $b['copies'], 15);
    $p->put(383, 1008, 180, 20, "Customer's Signatory", 13.5);
    $p->put(570, 1008, 180, 20, 'Authorised Signatory', 13.5, '', 'R');
}

function alokInvoiceBottom(AlokInvoiceDoc $p, array $b, array $d, array $t, bool $isInvoice): void
{
    $top = 777;
    $p->hline(0, 759, $top);
    $p->vline(463, $top, $top + 188);

    $words = $t['priced'] || $isInvoice ? alokRupeesInWords($t['grand']) : '';
    $p->SetFont('Helvetica', '', $p->pt(14));
    $labelW = $p->GetStringWidth('Rupees in Words') / AlokInvoiceDoc::SX + 6;
    $p->put(16, $top + 19, $labelW, 22, 'Rupees in Words', 14);
    $size = 14.0;
    $l1 = $l2 = '';
    if ($words !== '') {
        for (; $size >= 8; $size -= 0.5) {
            $p->SetFont('Helvetica', '', $p->pt($size));
            $l1 = $p->wrap($words, $p->pw(463 - 25 - $labelW))[0] ?? '';
            $second = $p->wrap(trim(substr($words, strlen($l1))), $p->pw(438));
            $l2 = $second[0] ?? '';
            if (count($second) <= 1) {
                break;
            }
        }
    }
    $p->put(16 + $labelW, $top + 19, 463 - 25 - $labelW, 22, $l1, $size);
    $p->dotted(16 + $labelW, 454, $top + 40);
    $p->put(16, $top + 53, 438, 22, $l2, $size);
    $p->dotted(16, 454, $top + 74);
    $p->hline(0, 463, $top + 81);

    foreach (array_slice($b['bank'], 0, 5) as $i => $line) {
        $p->put(13, $top + 84 + $i * 16.5, 360, 16.5, (string) $line, 14, $i === 0 ? 'B' : '');
    }
    $qr = (string) ($b['upiqr'] ?? '');
    if ($qr !== '' && preg_match('#^([A-Za-z]:)?[\\\\/]#', $qr) !== 1) {
        $qr = dirname(__DIR__, 2) . '/' . $qr;
    }
    if ($qr !== '' && is_file($qr)) {
        try {
            $h = 72.0;
            $w = $h * 297 / 366;
            $info = @getimagesize($qr);
            if (is_array($info) && $info[1] > 0) {
                $w = $h * $info[0] / $info[1];
            }
            $p->Image($qr, $p->px(454 - $w), $p->py($top + 84), $p->pw($w), $p->ph($h));
        } catch (Throwable) {
        }
    }
    $p->hline(0, 463, $top + 159);

    $rows = [['Total Amount before Tax', $t['sub'] > 0 ? alokInr($t['sub']) : '']];
    if ($isInvoice) {
        foreach ($t['taxes'] as $tx) {
            $rows[] = [$tx[0], $tx[1] > 0 ? alokInr($tx[1]) : ''];
        }
        $rows[] = ['ROUND OFF :', $t['sub'] > 0 ? ($t['round'] >= 0 ? '+' : '-') . alokInr(abs($t['round'])) : ''];
        $rows[] = ['GRAND TOTAL :', $t['sub'] > 0 ? alokInr((float) $t['grand']) : ''];
    } else {
        $rows = [['Total (before GST)', $t['priced'] ? alokInr($t['sub']) : ($t['sub'] > 0 ? alokInr($t['sub']) . ' + on request' : 'Price on request')]];
    }
    $rowH = $isInvoice ? min(36.0, 162 / count($rows)) : 27.0;
    $y = $top;
    foreach ($rows as $i => [$label, $val]) {
        $bold = $isInvoice && $i === count($rows) - 1;
        $p->put(463 + 12, $y, 166, $rowH, $label, 14.5, $bold ? 'B' : '');
        $p->put(463 + 185, $y, 296 - 185 - 8, $rowH, $val, 14.5, $bold ? 'B' : '', 'R');
        $y += $rowH;
        $p->hline(463, 759, $y);
    }
    $p->vline(463 + 181, $top, $y);
    if ($isInvoice) {
        $p->put(463 + 12, $top + 162, 296 - 12, 26, 'GST Payable on Reverse Charge : ' . (string) ($d['reverse_charge'] ?? 'No'), 14);
    } else {
        $p->SetFont('Helvetica', 'I', $p->pt(11));
        foreach ($p->wrap(alokPdfText((string) $b['proforma_note']), $p->pw(296 - 24), 6) as $i => $line) {
            $p->put(463 + 12, $y + 8 + $i * 15, 296 - 20, 15, $line, 11, 'I');
        }
    }
}

function alokInvoicePdf(array $d, string $type = 'invoice'): string
{
    $isInvoice = $type !== 'proforma';
    $b = alokBusiness();
    $items = array_values(array_filter((array) ($d['items'] ?? []), 'is_array'));
    $t = alokInvoiceTotals($d, $isInvoice);

    $p = new AlokInvoiceDoc();
    $p->SetTitle($isInvoice ? 'GST Invoice' : 'Proforma Invoice');
    $p->SetAuthor('Alok Plastics');
    $p->SetCreator('Alok Plastics');

    $descW = $p->pw(405) - 2.4;
    $bodyH = $p->ph(777 - 367);
    $lineH = 4.2;
    $rows = [];
    foreach ($items as $i => $it) {
        $p->SetFont('Helvetica', '', $p->pt(14));
        $lines = $p->wrap(alokPdfText((string) ($it['name'] ?? '')), $descW) ?: [''];
        $qty = (float) ($it['qty'] ?? 0);
        $hasPrice = isset($it['price']) && is_numeric($it['price']);
        $price = $hasPrice ? (float) $it['price'] : 0.0;
        $rows[] = [
            'sn' => (string) ($i + 1),
            'lines' => $lines,
            'hsn' => (string) ($it['hsn'] ?? ''),
            'qty' => trim(rtrim(rtrim(number_format($qty, 3, '.', ''), '0'), '.') . ' ' . (string) ($it['unit'] ?? '')),
            'rate' => $hasPrice ? alokInr($price) : '-',
            'amt' => $hasPrice ? alokInr($price * $qty) : 'On request',
            'h' => max($p->ph(22), count($lines) * $lineH + 1.8),
        ];
    }

    $note = trim((string) ($d['note'] ?? ''));
    if ($note !== '') {
        $p->SetFont('Helvetica', 'I', $p->pt(13));
        $noteLines = $p->wrap(alokPdfText('Note: ' . $note), $descW, 3);
        $rows[] = ['sn' => '', 'lines' => $noteLines, 'hsn' => '', 'qty' => '', 'rate' => '', 'amt' => '', 'h' => count($noteLines) * $lineH + 4, 'note' => true];
    }

    $pages = [[]];
    $used = 0.0;
    foreach ($rows as $r) {
        if ($used + $r['h'] > $bodyH && $pages[count($pages) - 1] !== []) {
            $pages[] = [];
            $used = 0.0;
        }
        $pages[count($pages) - 1][] = $r;
        $used += $r['h'];
    }

    foreach ($pages as $pi => $chunk) {
        $p->AddPage();
        alokInvoiceFrame($p, $b, $d, $isInvoice);
        $y = $p->py(367);
        foreach ($chunk as $r) {
            $p->SetFont('Helvetica', empty($r['note']) ? '' : 'I', $p->pt(empty($r['note']) ? 14 : 13));
            $p->SetXY($p->px(0), $y + ($r['h'] - $lineH) / 2);
            $p->Cell($p->pw(33), $lineH, $r['sn'], 0, 0, 'C');
            $ly = $y + ($r['h'] - count($r['lines']) * $lineH) / 2;
            foreach ($r['lines'] as $li => $line) {
                $p->SetXY($p->px(33) + 1.2, $ly + $li * $lineH);
                $p->Cell($descW, $lineH, $line, 0, 0, 'L');
            }
            foreach ([[438, 69, $r['hsn'], 'C'], [507, 58, $r['qty'], 'R'], [565, 79, $r['rate'], 'R'], [644, 115, $r['amt'], 'R']] as [$cx, $cw, $txt, $al]) {
                $txt = alokPdfText($txt);
                $p->fitSize($txt, $p->pw($cw) - 2.4, $p->pt(14), 'Helvetica', '');
                $p->SetXY($p->px($cx) + 1.2, $y + ($r['h'] - $lineH) / 2);
                $p->Cell($p->pw($cw) - 2.4, $lineH, $txt, 0, 0, $al);
            }
            $y += $r['h'];
        }
        if ($pi === count($pages) - 1) {
            alokInvoiceBottom($p, $b, $d, $t, $isInvoice);
        } else {
            $p->hline(0, 759, 777);
            $p->put(13, 777 + 80, 440, 20, 'Continued on next page...', 14, 'I');
        }
    }

    return $p->Output('S');
}
