# 参与船长待办

谢谢愿意来帮忙！修错字、补文档、报问题、写代码都欢迎。

## 动手之前

- 小改动（修 bug、改文档）直接提合并请求就行。
- 新功能先开个议题聊一下。船长待办想一直保持轻、快、数据只在本机，太重的功能不一定会做。
- 安全问题别公开，按 [SECURITY.md](https://github.com/heihuzi-labs/.github/blob/main/SECURITY.md) 私下报告。

## 跑起来

需要 Node.js 20 以上和 Rust。

```sh
npm ci --legacy-peer-deps
npm run tauri:dev
```

架构、数据流和维护约定见 [项目说明](docs/项目说明.md)。

## 提交前跑这些

和自动检查跑的一样：

```sh
npm run build
cd src-tauri && cargo check --locked
```

改了界面请附截图。

## 这几条请特别注意

- **别弄丢用户的数据。** 改了数据库结构，请在 Rust 那一侧加迁移，保证老版本的数据升级后还在、还能用。
- **数据只在本机。** 不要加上传、同步、统计之类会把数据发出去的东西。
- 别把自己的数据库文件、安装包提交进来（`.gitignore` 已经挡了 `*.db` 和 `*.dmg`）。

## 合并请求

写清楚改了什么、为什么、怎么验证的，模板里都有。一个合并请求只做一件事。

提交的代码按 [MIT](LICENSE) 许可证发布。

---

## Contributing (English)

Thanks for helping! Typos, docs, bug reports and code are all welcome.

- Small fixes: open a pull request directly. New features: open an issue first; Captain Todo aims to stay light, fast and local-only. Security problems: report privately, see [SECURITY.md](https://github.com/heihuzi-labs/.github/blob/main/SECURITY.md).
- Setup: Node.js 20+ and Rust. `npm ci --legacy-peer-deps`, then `npm run tauri:dev`. Architecture notes are in [docs/项目说明.md](docs/项目说明.md) (in Chinese).
- Before submitting (same as CI): `npm run build` and `cd src-tauri && cargo check --locked`. Attach screenshots for UI changes.
- Don't lose user data: schema changes need a migration on the Rust side so existing data survives upgrades. Data stays local; no upload, sync or analytics. Don't commit your own database files or installers.
- Contributions are released under the [MIT](LICENSE) license.
