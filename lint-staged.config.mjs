export default {
    '**/*.{js,jsx,ts,tsx,mjs,mts}': [
        'bash -c tsc --noEmit',
        'eslint --fix',
        'prettier --write',
    ],
    '**/*.{json,md}': ['prettier --write'],
};
