import { StatusBadge, timeAgo, CATEGORIES, ACADEMIC_LEVELS } from '../../components/common/StatusHelpers';
```

---

## The Rule
Pages inside `pages/public/` or `pages/client/` or `pages/admin/` are **two folders deep** inside `src/`, so they need `../../` to go back up to `src/` before reaching `components/`.
```
src/
├── components/common/StatusHelpers.jsx   ← destination
└── pages/
    └── public/
        └── TopicsPage.jsx               ← you are here
                                         ← ../../ goes back to src/
