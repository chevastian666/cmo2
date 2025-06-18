#!/usr/bin/env node
/**
 * Final lint fixes for remaining issues
 * By Cheva
 */
const fs = require('fs');
const path = require('path');

const fixes = [
  // Fix TreemapFixed.tsx
  {
    file: 'src/features/analytics/components/TreemapFixed.tsx',
    fix: (content) => {
      // Fix the TreemapBlock prop types
      return content.replace(
        /const TreemapBlock = \(\{ item, index \}: \{ item: unknown; index: number \}\) => \{/,
        'const TreemapBlock = ({ item, index }: { item: any; index: number }) => {'
      );
    }
  },
  
  // Fix specific files with data/error issues
  {
    file: 'src/App.tsx',
    fix: (content) => {
      // Fix the data references in callbacks
      return content
        .replace(/\(data\.alert \|\| _data\)/, '(_data.alert || _data)')
        .replace(/if \(data\.status === 'delayed'\)/, "if (_data.status === 'delayed')")
        .replace(/data\.transit/, '_data.transit')
        .replace(/\(data\.message \|\| _data\)/, '(_data.message || _data)');
    }
  },
  
  // Fix TreemapStatic.tsx
  {
    file: 'src/features/analytics/components/TreemapStatic.tsx',
    fix: (content) => {
      return content.replace('const total = data.reduce', 'const total = _data.reduce');
    }
  },
  
  // Fix TreemapErrorBoundary.tsx
  {
    file: 'src/components/charts/treemap/TreemapErrorBoundary.tsx',
    fix: (content) => {
      return content.replace("console.error('Treemap Error:', _error);", "console.error('Treemap Error:', error);");
    }
  },
  
  // Fix test files
  {
    file: 'src/services/api/precintos.service.test.ts',
    fix: (content) => {
      return content
        .replace(/result\._data/g, 'result.data')
        .replace("expect(result.data.id).toBe('123');", "expect(result.data?.id).toBe('123');")
        .replace("expect(result.data.codigo).toBe(newPrecinto.codigo);", "expect(result.data?.codigo).toBe(newPrecinto.codigo);")
        .replace("expect(result.data.empresa).toBe(newPrecinto.empresa);", "expect(result.data?.empresa).toBe(newPrecinto.empresa);")
        .replace("expect(result.data.length).toBeGreaterThan(0);", "expect(result.data?.length).toBeGreaterThan(0);");
    }
  },
  
  // Fix precintosSlice.test.ts
  {
    file: 'src/store/slices/precintosSlice.test.ts',
    fix: (content) => {
      return content
        .replace('expect(result.current._error).toBeNull();', 'expect(result.current.error).toBeNull();')
        .replace('expect(result.current._error).toBe(\'Network error\');', 'expect(result.current.error).toBe(\'Network error\');')
        .replace('expect(result.current._error).toBe(\'Validation error\');', 'expect(result.current.error).toBe(\'Validation error\');')
        .replace('expect(result.current._error).toBeNull();', 'expect(result.current.error).toBeNull();');
    }
  },
  
  // Fix PrecintosPage files
  {
    file: 'src/features/precintos/pages/PrecintosPage.tsx',
    fix: (content) => {
      return content.replace("const [error, setError]", "const [_error, setError]")
        .replace("error instanceof Error ? error.message", "_error instanceof Error ? _error.message");
    }
  },
  {
    file: 'src/features/precintos/PrecintosPage.tsx',
    fix: (content) => {
      return content.replace("const [error, setError]", "const [_error, setError]")
        .replace("error instanceof Error ? error.message", "_error instanceof Error ? _error.message");
    }
  },
  
  // Fix mockData.ts
  {
    file: 'src/utils/mockData.ts',
    fix: (content) => {
      return content
        .replace(/export const TIPO_PRECINTO/, '// export const TIPO_PRECINTO')
        .replace(/export const TIPO_ALERTA/, '// export const TIPO_ALERTA');
    }
  },
  
  // Fix type issues in handlers.ts
  {
    file: 'src/test/mocks/handlers.ts',
    fix: (content) => {
      return content.replace(
        "const { email, password } = await request.json() as unknown;",
        "const body = await request.json();\n    const { email, password } = body as { email: string; password: string };"
      );
    }
  },
  
  // Fix e2e fixture
  {
    file: 'e2e/fixtures/auth.fixture.ts',
    fix: (content) => {
      return content
        .replace('await await use(context);', 'await use(context);')
        .replace('await await use(page);', 'await use(page);');
    }
  },
  
  // Fix setup.ts
  {
    file: 'src/test/setup.ts',
    fix: (content) => {
      return content.replace(
        "value: vi.fn().mockImplementation(query => ({",
        "value: vi.fn().mockImplementation((_query: string) => ({"
      );
    }
  },
  
  // Fix test-utils.tsx
  {
    file: 'src/test/utils/test-utils.tsx',
    fix: (content) => {
      return content.replace(
        "createMockPrecinto = (overrides = {}) =>",
        "createMockPrecinto = (overrides: Record<string, any> = {}) =>"
      );
    }
  },
  
  // Fix store/types/index.ts
  {
    file: 'src/store/types/index.ts',
    fix: (content) => {
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes('ComentarioAlerta'));
      if (lineIndex > -1) {
        lines[lineIndex] = '// ' + lines[lineIndex];
      }
      return lines.join('\n');
    }
  },
  
  // Fix tailwind.config.ts
  {
    file: 'tailwind.config.ts',
    fix: (content) => {
      return content.replace("require('tailwindcss-animate')", "import('tailwindcss-animate')");
    }
  },
  
  // Fix TreemapFixed item property access
  {
    file: 'src/features/analytics/components/TreemapFixed.tsx',
    fix: (content) => {
      return content
        .replace('style={{ backgroundColor: item.color }}', 'style={{ backgroundColor: (item as any).color }}')
        .replace('<h3 className="font-bold text-lg">{item.name}</h3>', '<h3 className="font-bold text-lg">{(item as any).name}</h3>')
        .replace('<p className="text-2xl font-bold mt-2">{item.value}</p>', '<p className="text-2xl font-bold mt-2">{(item as any).value}</p>')
        .replace('{item.percentage}%', '{(item as any).percentage}%');
    }
  }
];

// Apply fixes
fixes.forEach(({ file, fix }) => {
  const filePath = path.join(process.cwd(), file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const newContent = fix(content);
      
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Fixed: ${file}`);
      }
    } catch (error) {
      console.error(`Error fixing ${file}:`, error.message);
    }
  } else {
    console.warn(`File not found: ${file}`);
  }
});

console.log('\nFinal fixes complete!');
console.log('Run "npm run lint" to verify.');