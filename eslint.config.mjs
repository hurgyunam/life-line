import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// tseslint.config 대신 tseslint.config() 없이 배열로 바로 내보내거나 
// 아래와 같이 설정하면 최신 규격에 맞습니다.
export default [
    {
        // 1. 전역 무시 설정
        ignores: [
            'node_modules/**',
            'dist/**',
            '.next/**',
            '.cursor/**',
            'build/**',
            'out/**',
            'public/**'
        ],
    },
    // 2. 기본 추천 설정들 (평탄화하여 전개)
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // 3. 메인 소스 코드 규칙
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single', { 'avoidEscape': true }],
            'semi': ['error', 'always'],
            '@typescript-eslint/no-unused-vars': 'off',
            'no-unused-vars': 'off',
        },
    },
    {
        // 4. 설정 파일용 규칙
        files: [
            '.storybook/*.ts',
            '*.config.js',
            '*.config.ts',
            '*.config.mjs',
            'postcss.config.js'
        ],
        rules: {
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            '@typescript-eslint/no-explicit-any': 'off',
        }
    }
];