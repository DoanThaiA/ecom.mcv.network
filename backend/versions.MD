# Version Development Report
## 1.3.0 (2026-08-12)
- **FEAT**: Trang admin `/admin/nhanh-reconcile` — đối soát dữ liệu website với Nhanh.vn.
- **Tra cứu từng mục**: nhập mã sản phẩm hoặc mã đơn, xem trạng thái/tồn kho hai bên cạnh nhau, có nút sửa kèm trang xác nhận (đúng khuôn `/admin/sync-retry`).
- **Đối soát theo lô**: lấy mẫu có giới hạn (mặc định 300, tối đa 1.000), báo tỷ lệ lệch và liệt kê mục lệch. **Chỉ đọc, không có nút sửa hàng loạt** — sửa hàng loạt cần sao lưu, nhật ký, canary và đường khôi phục, những thứ một request HTTP không làm tử tế được; script đầy đủ nằm ở `.local/nhanh-migration/`. Trang ghi rõ điều này ngay đầu.
- Hai quy tắc so sánh được rút ra từ chính dữ liệu production, không hiển nhiên:
  - So `inventory.available`, **không** so field `stock`. `stock` là giá trị cộng dồn cũ và trễ nhịp — ngày 12/08 SKU `15QDD2083ST-trắng-XL` có `stock: 8` trong khi `inventory.available` và Nhanh đều là 0. So `stock` sẽ báo nhầm hàng trăm SKU đang bình thường.
  - **Không so tồn kho trên sản phẩm cha**. Nhanh luôn báo `available: 0` ở doc cha vì tồn nằm ở biến thể con, còn mình lưu tổng của con lên cha. So thẳng thì mọi sản phẩm cha đều bị đếm là lệch.
- Dùng `product/list` + `filters.ids` chứ không phải `product/detail`: chỉ endpoint list nhận danh sách id, và lọc theo id **bỏ qua bộ lọc trạng thái** nên vẫn lấy được sản phẩm đã bị hạ về "Mới"/"Ngừng bán" — đúng nhóm rơi khỏi feed sync và không bao giờ tự khỏi.
- **An toàn khi sửa**: chỉ `updateOne` theo `_id` kèm điều kiện giá trị người dùng đang nhìn thấy, nên nếu webhook vừa đổi thì bỏ qua chứ không đè. Sản phẩm chỉ `$set` `status` + `snapshot.status`; đơn hàng chỉ `$set` `status`. **Không** đẩy CDP, **không** đụng hoa hồng affiliate, không chạm document hay collection nào khác.
- Bảng ánh xạ trạng thái đơn được chép từ `NhanhWebhookService.mapNhanhStatusToOrderStatus` thay vì tách chung, để không phải sửa luồng webhook đang chạy; có test duyệt toàn bộ enum `NhanhOrderStatus` nên bản chép không thể trôi lệch âm thầm.
- Dùng chung Basic Auth với các trang admin khác. Không đổi luồng nghiệp vụ nào.
- Files: `src/admin-nhanh-reconcile/*`, `test/admin-nhanh-reconcile/*`, `src/app.module.ts`, `src/main.ts`.
- Back-port từ `main` (PR #1846, commit `ba6d9f05`).

## 1.2.0 (2026-08-12)
- **FEAT**: Trang admin `/admin/webhook-health` — theo dõi webhook Nhanh.vn còn nhận được hay đã ngừng.
- Bối cảnh: webhook Nhanh chết từ ~14/07/2026 tới 12/08/2026 mà không ai biết, gây lệch 447 sản phẩm / 2.095 đơn / hàng nghìn SKU tồn kho. Mất gần hai ngày điều tra chỉ để trả lời "webhook còn sống không", và cuối cùng phải nhờ khách mở tab API bên Nhanh mới xác nhận được — vì phía mình không ghi lại gì.
- Trang hiển thị theo từng loại sự kiện: lần nhận gần nhất, số lượt trong 24h / 7 ngày / tổng, và cảnh báo khi im lặng quá ngưỡng riêng của từng loại. Sự kiện **chưa từng nhận** vẫn có dòng riêng — đây là tín hiệu quan trọng nhất, nếu ẩn đi sẽ trông như bình thường.
- Ghi nhận vào **collection mới `webhook_health`**, tối đa 1 doc cho mỗi loại sự kiện nên không phình theo lưu lượng. Không đụng `orders`, `products` hay collection nào khác.
- Lệnh ghi **không bao giờ ném lỗi và không được await** trên đường xử lý webhook: đo đạc hỏng thì webhook vẫn phải trả HTTP 200, vì Nhanh tắt webhook của app sau vài lần nhận response khác 200.
- Trang **chỉ đọc**, dùng chung Basic Auth với `/admin/sync-retry`. Ghi duy nhất là dọn bộ đếm theo ngày cũ hơn 14 ngày, chỉ `$unset` các khoá `daily.*` của chính collection này.
- Đếm cả payload **không qua validate** — trường hợp Nhanh có gửi nhưng mình không hiểu cấu trúc, hiện đang bị nuốt im lặng.
- Ghi nhận: `src/nhanh/nhanh-webhook.controller.ts` hiện **không được đăng ký ở module nào** (code chết, chỉ controller bên worker nhận traffic thật). Vẫn sửa cho nhất quán và khai báo `WebhookHealthModule` trong `NhanhModule` để DI hợp lệ nếu sau này bật lên.
- Back-port từ `main` (PR #1843, commit `4cc9a90e`).
- Files: `src/webhook-health/*`, `src/admin-webhook-health/*`, `test/admin-webhook-health/*`, `src/nhanh/nhanh-webhook.controller.ts`, `src/nhanh/nhanh.module.ts`, `worker/src/webhooks/*`, `src/app.module.ts`, `src/main.ts`.

## 1.1.3 (2026-08-12)
- **FIX**: Thêm snapshotId (Nhanh product ID) làm suffix vào slug khi tạo mới sản phẩm trong bulkUpsert tránh bị xung đột slug với các sản phẩm khác có cùng tên.
- Files: `src/products/model/product.repository.ts`

## 1.1.2 (2026-08-07)
- **FIX**: Endpoint webhook Nhanh.vn luôn trả HTTP 200, kể cả khi payload không qua được validate.
- Trước đây payload lạ (event chưa khai trong enum, hoặc sai kiểu dữ liệu) làm controller ném `BadRequestException` → **HTTP 400**. Theo tài liệu Nhanh, response khác 200 bị retry 3 lần rồi **app bị tắt webhook**; webhook tắt là im lặng hoàn toàn và chỉ bật lại được từ tài khoản sở hữu app trên `open.nhanh.vn/apps`.
- Đây là cơ chế duy nhất phía mình có thể tự gây mất webhook. Sự cố 14/07/2026 (app 76678 ngừng nhận webhook, gây lệch 223 sản phẩm / 1.746 đơn / 762 SKU tồn kho) khớp với cơ chế này, tuy chưa chứng minh được vì đã mất quyền truy cập app cũ.
- Payload lỗi vẫn được log ở mức `warn` kèm tên event, chỉ khác là không còn kéo sập cả tích hợp.
- Back-port từ `main` (PR #1837, commit `acc885a1`).
- Files: `worker/src/webhooks/nhanh-webhook.controller.ts`, `src/nhanh/nhanh-webhook.controller.ts`.

## 1.1.1 (2026-08-05)
- **FIX**: Back-port bản vá đồng bộ Nhanh.vn từ `main` (commit `a5e1182f`) về `internal`. Nhánh `internal` trước đó vẫn chạy code cũ nên worker internal (1.0.68) xử lý job sai khác với worker prod (1.0.69).
- Bỏ mốc `updatedAtFrom` khỏi request `product/list` và `product/inventory` để mỗi lần sync quét toàn bộ, thay vì chỉ lấy sản phẩm đổi trong 24h.
- Mở rộng bộ lọc trạng thái từ `[2]` thành `[2, 4]` để kéo về cả hàng hết tồn.
- `buildProductMapping()` dùng `getNhanhIdMapping()` (đã có sẵn ở internal) thay cho vòng phân trang cũ trả về 0 entries.
- Bump worker 1.0.68 → 1.0.69 để kích hoạt build lại image internal.
- **CHORE (chỉ internal)**: hardcode `REDIS_URL` về `redis://localhost:6379` trong `src/utils/env.ts` để backend/worker internal ngừng nối Redis production và thôi tiêu thụ chung hàng đợi BullMQ với prod. Không được merge dòng này lên `main`.
- Files: `src/products/domain/product.repository.ts`, `worker/src/services/nhanh-sync.service.ts`, `worker/version.json`.

## 1.1.0 (2026-07-31)
- **FEAT**: Bổ sung media cho ba vùng mô tả sản phẩm trong Product detail.
- Thêm DTO validation, schema, mapper và atomic update cho các mảng URL có thứ tự.
- Loại media khỏi product listing/export; sản phẩm cũ không cần migration.

## 1.0.549 (2026-07-30)
- **FIX**: Khắc phục lỗi đồng bộ tồn kho Nhanh.vn (tạo phương thức `getNhanhIdMapping()` sửa dứt điểm lỗi mapping 0 entries; loại bỏ mốc thời gian `updatedAtFrom` gây lỗi 422; bổ sung `status: [2, 4]` kéo cả hàng hết tồn out of stock).
- Files: `src/products/domain/product.repository.ts`, `src/products/model/product.repository.ts`, `worker/src/services/nhanh-sync.service.ts`.

## 1.0.550 (2026-07-24)
- **FEAT**: Sắp xếp mặc định cho danh sách sản phẩm thành **Mới nhất** (Mới > Cũ, `createdAt` desc) đồng bộ trên toàn storefront/shop và database repository.
- Cập nhật test case default sort tương ứng trong `shop.service.spec.ts` và sửa lỗi mock dependencies cùng logic NEW product của test suite.
- Files: `src/shop/shop.service.ts`, `src/products/model/product.repository.ts`, `test/shop/shop.service.spec.ts`.

## 1.0.546 (2026-07-21)
- **FEAT**: thêm endpoint public read-only `GET /api/v1/shop/products/:productId/promotion-highlights` cho PDP, trả CTKM vận chuyển, giảm giá hóa đơn và quà tặng liên quan; `BUY_X_GET_Y` chỉ query đúng sản phẩm cần mua.
- **Hiệu năng**: cache theo product tối đa 30 giây, gộp cache miss đồng thời trong cùng process, chạy ba query đầu song song, batch-load product tham chiếu bằng projection gọn và batch-load trạng thái child variant qua index `parent.id`; bổ sung compound index cho product-targeted `BUY_X_GET_Y`.
- **An toàn hiển thị quà**: chỉ public product/variant ACTIVE và không hidden; quà active nhưng hết tồn vẫn được trả với `isAvailable=false`, còn hidden/inactive/deleted bị loại hoàn toàn; availability của parent gift đọc live child variants thay vì phụ thuộc bản variants embed có thể cũ.
- **Contract & quality**: bổ sung DTO/proto tương ứng và test cho query targeting, mapping, cache, fail-soft, request coalescing, quota cùng visibility/availability của quà.
- Files: `src/shop/promotion/product-promotion-highlights.*`, `src/shop/promotion/dto/product-promotion-highlights-response.dto.ts`, product/promotion/shipping repositories, promotion schema/index, `proto/shop/shop/shop.proto`, `test/shop/promotion/product-promotion-highlights.*.spec.ts`.

## 1.0.544 (2026-07-20)
- **FEAT**: Khách chưa đăng nhập (guest) áp được mã giảm giá CMS (`ORDER_DISCOUNT` / `PROMO_CODE`) — chỉ cần đơn hàng đủ điều kiện
- Tick "Mã dùng 1 lần cho 1 user" (`singleUsePerCustomer`) **không** áp cho guest: không có `userId` thì không tra được `promotion_usage_records`, và shop chấp nhận đánh đổi này. Khách đã đăng nhập vẫn bị chặn như cũ
- Giới hạn tổng lượt dùng (`totalUsageLimit`) **vẫn** chặn cả guest lẫn user — counter `currentUsageCount` là toàn cục, không cần định danh
- Voucher CDP vẫn yêu cầu đăng nhập (cần `cdpCustomerId`); đổi mã lỗi từ **401 → 422** vì 401 bị axios refresh-token interceptor ở FE nuốt mất message và ép logout
- Files: `src/shop/promotion/shop-promotion.service.ts`, `test/shop/promotion/shop-promotion.service.spec.ts`

## 1.0.543 (2026-06-30)
- **FEAT**: Bỏ hẳn Viettel Post khỏi luồng tạo đơn (bên shop không dùng VTP nữa). Luồng NVS giờ là **SPX (29) → Tự Vận Chuyển (TVC)** — SPX rỗng/lỗi thì về thẳng TVC (không còn bước Viettel)
- `calculateShippingFee` chỉ thử type 2 với SPX (29); xóa `FALLBACK_SHIPPING_CARRIER_ID` và vòng lặp priority
- `ShippingService` chọn gói rẻ nhất của carrier trả về (SPX 1 gói "Giao tiêu chuẩn"); bỏ ưu tiên `ECOD` của Viettel
- Cập nhật unit test: SPX rỗng → TVC (thay các test fallback Viettel) + doc comment
- Files: `src/nhanh/dto/nhanh-order.dto.ts`, `src/nhanh/services/nhanh-shipping.service.ts`, `src/shop/shipping/shipping.service.ts`, `src/shop/shipping/dto/shipping.dto.ts`, `test/shop/shipping/shipping.service.spec.ts`, `test/nhanh/services/nhanh-shipping.service.spec.ts`

## 1.0.542 (2026-06-30)
- **FEAT**: Đổi đơn vị vận chuyển (DVVC) mặc định sang **SPX Express** với chuỗi ưu tiên cho luồng tài khoản riêng của shop (type 2 / NVS): **SPX (29) → Viettel Post (2) → Tự Vận Chuyển (TVC)**
- Thêm hằng số dùng chung `DEFAULT_SHIPPING_CARRIER_ID = 29` và `FALLBACK_SHIPPING_CARRIER_ID = 2` (`src/nhanh/dto/nhanh-order.dto.ts`)
- `calculateShippingFee` thử type 2 lần lượt SPX (29) rồi Viettel (2); carrier nào ra cước trước thì dùng; cả hai rỗng/lỗi thì về TVC (giữ nguyên cơ chế fallback TVC)
- `ShippingService` chọn gói dịch vụ trong carrier trả về: Viettel → `ECOD` (như cũ), SPX/TVC → gói rẻ nhất
- Mapper `order/add` không đổi logic
- Cập nhật unit test (shipping service, nhanh shipping service: thêm test nhánh 29→2) + doc comment
- **SPX NVS đã hoạt động**: `/shipping/fee` type 2 carrier 29 trả cước khi request có `shippingTo.wardId` (account "Cchatclothes" accountId 7610, service "Giao tiêu chuẩn" code `DefaultService`, shipFee 11000). Code đã truyền sẵn `shippingTo.wardId` nên đơn có đủ phường sẽ đi SPX; đơn thiếu wardId tự rơi về Viettel (2) rồi TVC — an toàn deploy
- Files: `src/nhanh/dto/nhanh-order.dto.ts`, `src/nhanh/services/nhanh-shipping.service.ts`, `src/shop/shipping/shipping.service.ts`, `src/shop/shipping/dto/shipping.dto.ts`, `src/shop/order/domain/order.ts`, `test/shop/shipping/shipping.service.spec.ts`, `test/nhanh/services/nhanh-shipping.service.spec.ts`

## 1.0.539 (2026-06-10)
- **FEAT**: Khi tài khoản hãng vận chuyển riêng của shop (type 2 / NVS) không khả dụng, đơn chuyển sang "Tự Vận Chuyển" (TVC, carrier id 12) thay vì fallback sang kết nối Nhanh (type 1 / NVN)
- Thêm `carrierType = 3` (SELF_SHIP) đi suốt checkout → order → mapper; payload `order/add` gửi `{ id: 12, serviceId: 25, customerShipFee }` không kèm `sendCarrierType` (Nhanh không tạo vận đơn hãng — shop tự giao + tự thu COD). Payload đã verify với Nhanh API thật
- Bỏ nhánh fallback NVN trong `calculateShippingFee` (xóa `fetchShippingFee`)
- Thêm unit test (mapper TVC, shipping service fallback) + flow test; bổ sung helper `test/helpers/domain-factories.ts`
- Files: `src/nhanh/dto/nhanh-order.dto.ts`, `src/nhanh/services/nhanh-shipping.service.ts`, `src/nhanh/mappers/order-nhanh.mapper.ts`, `src/shop/shipping/dto/shipping.dto.ts`, `src/shop/checkout/domain/checkout-session.ts`, `src/shop/checkout/model/checkout-session.mapper.ts`, `src/shop/order/domain/order.ts`, `src/shop/order/model/order.mapper.ts`

## 1.0.532 (2026-05-12)
- **FIX**: Cho phép Facebook iframe embed trong nội dung article (rich text)
- `sanitizeRichText` cho phép các style layout cần cho wrapper/iframe (`position`, `inset`, `max-width`, `aspect-ratio`, `margin`, các `border-*`)
- Thêm test với mẫu `<div data-facebook-video>` có iframe `plugins/video.php` aspect ratio `9 / 16`
- Files: `src/utils/sanitize.ts`, `test/utils/sanitize.spec.ts`

## 1.0.531 (2026-05-12)
- **FIX**: Giữ nguyên markup Facebook reel responsive khi lưu rich text từ CMS
- `sanitizeRichText` cho phép các style layout cần cho wrapper/iframe (`position`, `inset`, `max-width`, `aspect-ratio`, `margin`, các `border-*`)
- Thêm test với mẫu `<div data-facebook-video>` có iframe `plugins/video.php` aspect ratio `9 / 16`
- Files: `src/utils/sanitize.ts`, `test/utils/sanitize.spec.ts`

## 1.0.530 (2026-05-12)
- **FIX**: Cho phép Facebook iframe embed trong nội dung rich text
- `sanitizeRichText` mở rộng whitelist iframe cho Facebook plugin domains (`facebook.com`, `www.facebook.com`, `web.facebook.com`, `m.facebook.com`)
- Bổ sung các attribute/style thường có trong Facebook embed (`allowtransparency`, `title`, `loading`, `scrolling`, `style`, `position`, `inset`, `width`, `max-width`, `height`, `aspect-ratio`, `margin`, `border`, `border-width`, `border-style`, `border-color`, `border-image`, `overflow`)
- Giữ các `data-*` của Facebook Embedded Video Player theo docs (`data-href`, `data-width`, `data-allowfullscreen`, `data-autoplay`, `data-lazy`, `data-show-text`, `data-show-captions`)
- Thêm test đảm bảo Facebook iframe/SDK div được giữ lại và iframe từ domain lạ vẫn bị strip
- Files: `src/utils/sanitize.ts`, `test/utils/sanitize.spec.ts`

## 1.0.529 (2026-05-09)
- **FIX**: Cho phép YouTube iframe embed trong nội dung article (rich text)
- `sanitizeRichText` thêm `iframe` vào allowedTags cùng các attribute hợp lệ (`src`, `width`, `height`, `frameborder`, `allow`, `allowfullscreen`, `referrerpolicy`)
- Thêm `data-youtube-video` attribute cho `<div>` để giữ wrapper của TipTap YouTube extension
- Restrict iframe bằng `allowedIframeHostnames` chỉ cho YouTube domain (`youtube.com`, `www.youtube.com`, `www.youtube-nocookie.com`) để tránh XSS/clickjacking từ random domain
- Trước fix: iframe bị strip → news article có YouTube embed lưu xong trả về `<div></div><p></p>`
- Files: `src/utils/sanitize.ts`
