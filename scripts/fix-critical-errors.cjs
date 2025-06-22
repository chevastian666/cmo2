#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 CRITICAL ERROR CLEANUP: Fixing parsing errors and variable issues');

// Files that need critical fixes based on the read results
const criticalFixes = [
  {
    file: 'src/features/armado/pages/ArmadoPageV2.tsx',
    fixes: [
      // Fix underscore prefixed variables that should not be prefixed
      { find: /const \[searching, setSearching\] = useState\(_false\)/g, replace: 'const [searching, setSearching] = useState(false)' },
      { find: /const \[results, setResults\] = useState<Precinto\[\]>\(\[\]\)/g, replace: 'const [results, setResults] = useState<Precinto[]>([])' },
      { find: /const \[hasSearched, setHasSearched\] = useState\(_false\)/g, replace: 'const [hasSearched, setHasSearched] = useState(false)' },
      { find: /await new Promise\(resolve => setTimeout\(_resolve, 500\)\)/g, replace: 'await new Promise(resolve => setTimeout(resolve, 500))' },
      { find: /setResults\(_filtered\)/g, replace: 'setResults(filtered)' },
      { find: /setHasSearched\(_false\)/g, replace: 'setHasSearched(false)' },
      { find: /value={_value}/g, replace: 'value={value}' },
      { find: /onChange={(_e) => onChange\(e\.target\.value\)}/g, replace: 'onChange={(e) => onChange(e.target.value)}' },
      { find: /onKeyPress={(_e) => e\.key === 'Enter' && handleSearch\(\)}/g, replace: 'onKeyPress={(e) => e.key === \'Enter\' && handleSearch()}' },
      { find: /onClick={_handleSearch}/g, replace: 'onClick={handleSearch}' },
      { find: /key={_prefix}/g, replace: 'key={prefix}' },
      { find: /onChange\(_prefix\)/g, replace: 'onChange(prefix)' },
      { find: /await new Promise\(resolve => setTimeout\(_resolve, 0\)\)/g, replace: 'await new Promise(resolve => setTimeout(resolve, 0))' },
      { find: /await new Promise\(resolve => setTimeout\(_resolve, 500\)\)/g, replace: 'await new Promise(resolve => setTimeout(resolve, 500))' },
      { find: /setResults\(_filtered\)/g, replace: 'setResults(filtered)' },
      { find: /setHasSearched\(_true\)/g, replace: 'setHasSearched(true)' },
      { find: /onClick={_prefix}/g, replace: 'onClick={prefix}' },
      { find: /{_prefix}/g, replace: '{prefix}' },
      { find: /results\.map\(\(_precinto, index\) =>/g, replace: 'results.map((precinto, index) =>' },
      { find: /onClick={\(\) => onSelect\(_precinto\)}/g, replace: 'onClick={() => onSelect(precinto)}' },
      { find: /\"{_value}\"/g, replace: '"{value}"' },
      { find: /const \[loading, setLoading\] = useState\(_false\)/g, replace: 'const [loading, setLoading] = useState(false)' },
      { find: /const \[showConfirmation, setShowConfirmation\] = useState\(_false\)/g, replace: 'const [showConfirmation, setShowConfirmation] = useState(false)' },
      { find: /const \[selectedPrecinto, setSelectedPrecinto\] = useState<Precinto \| null>\(_null\)/g, replace: 'const [selectedPrecinto, setSelectedPrecinto] = useState<Precinto | null>(null)' },
      { find: /setSelectedPrecinto\(_precinto\)/g, replace: 'setSelectedPrecinto(precinto)' },
      { find: /setShowConfirmation\(_true\)/g, replace: 'setShowConfirmation(true)' },
      { find: /setLoading\(_true\)/g, replace: 'setLoading(true)' },
      { find: /await new Promise\(resolve => setTimeout\(_resolve, 2000\)\)/g, replace: 'await new Promise(resolve => setTimeout(resolve, 2000))' },
      { find: /setLoading\(_false\)/g, replace: 'setLoading(false)' },
      { find: /setShowConfirmation\(_false\)/g, replace: 'setShowConfirmation(false)' },
      { find: /onSubmit={(_e) => { e\.preventDefault\(\); handleSubmit\(\); }}/g, replace: 'onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}' },
      { find: /value={_precintoSearch}/g, replace: 'value={precintoSearch}' },
      { find: /onChange={s_etPrecintoSearch}/g, replace: 'onChange={setPrecintoSearch}' },
      { find: /onSelect={_handlePrecintoSelect}/g, replace: 'onSelect={handlePrecintoSelect}' },
      { find: /onValueChange={(_v) => setFormData\(prev => \({ \.\.\.prev, tipoViaje: v as unknown }\)\)}/g, replace: 'onValueChange={(v) => setFormData(prev => ({ ...prev, tipoViaje: v as typeof formData.tipoViaje }))}' },
      { find: /onChange={(_e) => setFormData\(prev => \({ \.\.\.prev, ([^}]+) }\)\)}/g, replace: 'onChange={(e) => setFormData(prev => ({ ...prev, $1 }))}' },
      { find: /onValueChange={(_v) => setFormData\(prev => \({ \.\.\.prev, tipoDocumentoConductor: v }\)\)}/g, replace: 'onValueChange={(v) => setFormData(prev => ({ ...prev, tipoDocumentoConductor: v }))}' },
      { find: /onCheckedChange={(_checked) =>/g, replace: 'onCheckedChange={(checked) =>' },
      { find: /key={_i}/g, replace: 'key={i}' },
      { find: /isOpen={s_howConfirmation}/g, replace: 'isOpen={showConfirmation}' },
      { find: /onConfirm={_handleConfirmArm}/g, replace: 'onConfirm={handleConfirmArm}' },
      { find: /loading={_loading}/g, replace: 'loading={loading}' },
      { find: /precinto={s_electedPrecinto}/g, replace: 'precinto={selectedPrecinto}' },
      // Fix import issues
      { find: /import \{_Select,/g, replace: 'import { Select,' },
      { find: /import \{_Card,/g, replace: 'import { Card,' },
      // Fix component issues
      { find: /\(_Opcional\)/g, replace: '(Opcional)' }
    ]
  },
  {
    file: 'src/test/setup.ts',
    fixes: [
      { find: /Object\.defineProperty\(_window, 'matchMedia'/g, replace: 'Object.defineProperty(window, \'matchMedia\'' },
      { find: /Object\.defineProperty\(_navigator, 'geolocation'/g, replace: 'Object.defineProperty(navigator, \'geolocation\'' },
      { find: /;[\s]*\(global as unknown\)\.google =/g, replace: ';(global as any).google =' },
      { find: /LatLng: vi\.fn\(\(_lat, lng\) => \({ lat, lng }\)\)/g, replace: 'LatLng: vi.fn((lat, lng) => ({ lat, lng }))' },
      { find: /get length\(\) {\s*return Object\.keys\(s_tore\)\.length/g, replace: 'get length() {\n      return Object.keys(store).length' },
      { find: /key\(index: number\) {\s*const keys = Object\.keys\(s_tore\)/g, replace: 'key(index: number) {\n      const keys = Object.keys(store)' },
      { find: /Object\.defineProperty\(_window, 'localStorage'/g, replace: 'Object.defineProperty(window, \'localStorage\'' },
      { find: /Object\.defineProperty\(_window, 'sessionStorage'/g, replace: 'Object.defineProperty(window, \'sessionStorage\'' }
    ]
  },
  {
    file: 'src/workers/dataProcessor.worker.ts',
    fixes: [
      { find: /groupedData\[key\]\.push\(_item\)/g, replace: 'groupedData[key].push(item)' },
      { find: /aggregations\[`\$\{String\(_field\)\}_sum`\] = this\.sum\(_values\)/g, replace: 'aggregations[`${String(field)}_sum`] = this.sum(values)' },
      { find: /aggregations\[`\$\{String\(_field\)\}_avg`\] = this\.mean\(_values\)/g, replace: 'aggregations[`${String(field)}_avg`] = this.mean(values)' },
      { find: /const numericValues = this\.extractNumericValues\(_filteredData\)/g, replace: 'const numericValues = this.extractNumericValues(filteredData)' },
      { find: /const statistics = this\.calculateStatistics\(_numericValues\)/g, replace: 'const statistics = this.calculateStatistics(numericValues)' },
      { find: /filteredData\.sort\(\(_a, b\) => {/g, replace: 'filteredData.sort((a, b) => {' },
      { find: /const sorted = \[\.\.\.values\]\.sort\(\(_a, b\) => a - b\)/g, replace: 'const sorted = [...values].sort((a, b) => a - b)' },
      { find: /const sum = this\.sum\(_values\)/g, replace: 'const sum = this.sum(values)' },
      { find: /const median = this\.median\(s_orted\)/g, replace: 'const median = this.median(sorted)' },
      { find: /const avgSquaredDiff = this.sum\(s_quaredDiffs\) \/ values\.length/g, replace: 'const avgSquaredDiff = this.sum(squaredDiffs) / values.length' },
      { find: /const standardDeviation = Math\.sqrt\(_avgSquaredDiff\)/g, replace: 'const standardDeviation = Math.sqrt(avgSquaredDiff)' },
      { find: /if \(!buckets\.has\(_bucketKey\)\) {/g, replace: 'if (!buckets.has(bucketKey)) {' },
      { find: /buckets\.set\(_bucketKey, \[\]\)/g, replace: 'buckets.set(bucketKey, [])' },
      { find: /buckets\.get\(_bucketKey\)!\.push\(item\.value\)/g, replace: 'buckets.get(bucketKey)!.push(item.value)' },
      { find: /buckets\.forEach\(\(_values, timestamp\) => {/g, replace: 'buckets.forEach((values, timestamp) => {' },
      { find: /switch \(_aggregationType\) {/g, replace: 'switch (aggregationType) {' },
      { find: /value = this\.sum\(_values\)/g, replace: 'value = this.sum(values)' },
      { find: /value = this\.mean\(_values\)/g, replace: 'value = this.mean(values)' },
      { find: /const sorted = \[\.\.\.values\]\.sort\(\(_a, b\) => a - b\)/g, replace: 'const sorted = [...values].sort((a, b) => a - b)' },
      { find: /result\[`p\${_p}`\] = sorted\[Math\.max\(0, index\)\]/g, replace: 'result[`p${p}`] = sorted[Math.max(0, index)]' },
      { find: /const stats = this\.calculateStatistics\(_values\)/g, replace: 'const stats = this.calculateStatistics(values)' },
      { find: /values\.forEach\(\(_value, index\) => {/g, replace: 'values.forEach((value, index) => {' },
      { find: /return values\.reduce\(\(_acc, val\) => acc \+ val, 0\)/g, replace: 'return values.reduce((acc, val) => acc + val, 0)' },
      { find: /return values\.length > 0 \? this\.sum\(_values\) \/ values\.length : 0/g, replace: 'return values.length > 0 ? this.sum(values) / values.length : 0' },
      { find: /Object\.values\(_item\)\.forEach\(val => {/g, replace: 'Object.values(item).forEach(val => {' },
      { find: /if \(typeof val === 'number' && !isNaN\(_val\)\) {/g, replace: 'if (typeof val === \'number\' && !isNaN(val)) {' },
      { find: /values\.push\(_val\)/g, replace: 'values.push(val)' },
      { find: /const date = new Date\(_timestamp\)/g, replace: 'const date = new Date(timestamp)' },
      { find: /switch \(_interval\) {/g, replace: 'switch (interval) {' },
      { find: /return result\.sort\(\(_a, b\) => a\.timestamp - b\.timestamp\)/g, replace: 'return result.sort((a, b) => a.timestamp - b.timestamp)' }
    ]
  },
  {
    file: 'src/App.tsx',
    fixes: [
      { find: /import \{_useEffect, lazy, Suspense\} from 'react'/g, replace: 'import { useEffect, lazy, Suspense } from \'react\'' },
      { find: /client={_queryClient}/g, replace: 'client={queryClient}' },
      { find: /unsubscribers\.push\(sharedWebSocketService\.onAlertNew\(\(_data\) => {/g, replace: 'unsubscribers.push(sharedWebSocketService.onAlertNew((data) => {' },
      { find: /unsubscribers\.push\(sharedWebSocketService\.on\(SHARED_CONFIG\.WS_EVENTS\.TRANSIT_UPDATE, \(_data\) => {/g, replace: 'unsubscribers.push(sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.TRANSIT_UPDATE, (data) => {' },
      { find: /unsubscribers\.push\(sharedWebSocketService\.on\(SHARED_CONFIG\.WS_EVENTS\.CMO_MESSAGE, \(_data\) => {/g, replace: 'unsubscribers.push(sharedWebSocketService.on(SHARED_CONFIG.WS_EVENTS.CMO_MESSAGE, (data) => {' }
    ]
  }
];

// Apply fixes to each file
criticalFixes.forEach(({ file, fixes }) => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  console.log(`🔧 Fixing ${file}...`);
  let content = fs.readFileSync(fullPath, 'utf8');
  let changesMade = 0;
  
  fixes.forEach(({ find, replace }) => {
    const originalContent = content;
    content = content.replace(find, replace);
    if (content !== originalContent) {
      changesMade++;
    }
  });
  
  if (changesMade > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Applied ${changesMade} fixes to ${file}`);
  } else {
    console.log(`📝 No changes needed for ${file}`);
  }
});

console.log('🎯 Critical fixes completed');

// Run ESLint to check progress
try {
  console.log('\n📊 Checking current lint status...');
  const result = execSync('npm run lint 2>&1', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
  console.log('✅ ESLint check completed');
} catch (error) {
  console.log('📈 Current lint errors (this is expected during cleanup):');
  const lines = error.stdout.split('\n');
  const errorSummary = lines.filter(line => 
    line.includes('error') || 
    line.includes('warning') || 
    line.includes('problem')
  ).slice(-10);
  errorSummary.forEach(line => console.log('  ' + line));
}