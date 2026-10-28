# Claude Code Instructions

## BẮT BUỘC: Đọc AGENTS.md trước khi bắt đầu

Trước khi thực hiện BẤT KỲ task nào trong project này, **PHẢI đọc file `AGENTS.md`** để nắm rõ các quy tắc development.

```
Read file: AGENTS.md
```

## Tóm tắt nhanh các quy tắc quan trọng

1. **i18n** - Không hardcode text, tái sử dụng keys đã có
2. **Styling** - Dùng MUI sx prop, không viết CSS files
3. **Redux** - Dùng Redux Toolkit + Redux-Saga
4. **API** - Dùng Axios với repository pattern
5. **Table** - Dùng TanStack Table + components từ `src/components/table/`
6. **Toast** - Dùng utilities từ `src/utils/toast`
7. **Enum** - Dùng enum trực tiếp, không convert qua string
8. **Version** - Update version.json và versions.MD sau mỗi task

## Khi hoàn thành task

- [ ] Chạy `npm run fm:fix`
- [ ] Chạy `npm run build:check`
- [ ] Update version.json và versions.MD
