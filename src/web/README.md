# 体重日记 2.0 商业版

打开 `index.html` 即可使用。

基础功能保持免费：

- 按日期记录体重和日记
- 查看本月趋势图
- 本月统计
- JSON 备份导出
- JSON 备份导入
- 编辑和删除记录

VIP 功能：

- 全部历史趋势图
- 目标体重参考线
- 导出全部记录为 CSV

授权说明：

- `is_pro` 保存在浏览器/桌面/安卓应用各自的本地配置中。
- 当前实现使用“本机安装种子 + 环境指纹”生成 6 位设备码。
- 激活码由设备码和固定 Salt 经 SHA-256 计算生成。
- 当前 Salt：`WEIGHT_DIARY_PRO_2026_LOCAL_SALT`
- 如果你要更换 Salt，请同时修改 `license.js` 和 `tools/generate_activation_codes.py`。

面包多链接：

- 当前购买链接为 `https://mbd.pub/o/bread/YZaTm5txbA==`
- 后续如需更换购买链接，修改 `storage.js` 中 `buy_url` 默认值即可。
