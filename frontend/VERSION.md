# Version History
## 1.9.4 (2026-10-12)
- **Fix (Product Image)**: Tự động chuyển đổi đường dẫn ảnh thumbnail của biến thể từ Nhanh (`/ps/thumb/`) sang ảnh gốc chất lượng cao (`/ps/`) để tránh bị vỡ hạt và mờ khi hiển thị chi tiết sản phẩm.
- **Files**: `lib/utils/cchatImageLoader.ts`, `components/common/ProductImage.tsx`

## 1.9.3 (2026-09-25)
- **Fix**: Cập nhật số điện thoại cơ sở CCHAT - Hàng Vôi thành `0973 954 066`.
- **Files**: `lib/constants/stores.ts`

## 1.9.2 (2026-08-18)
- **Fix (Mobile Menu)**: Tái cấu trúc layout MobileMenuDrawer, đưa cụm Giỏ hàng, nút Đăng nhập và Footer liên hệ vào vùng cuộn chung, không còn bị ghim/dồn cứng ở đáy màn hình.
- **UX**: Thêm khoảng đệm đáy `pb-40` để nội dung liên hệ không bị che khuất bởi widget Chatbot khi cuộn xuống cuối menu.
- **Files**: `components/navigation/MobileMenuDrawer.tsx`

## 1.9.1 (2026-07-31)
- **UX**: Vùng ảnh dài giữ kích thước dễ xem và cuộn ngang nội bộ trên mobile.
- **Điều hướng**: Thêm nút mũi tên nổi để cuộn Vùng 3 theo từng đoạn; tự ẩn ở đầu/cuối ảnh.
- **An toàn layout**: Chỉ rail ảnh được kéo ngang, không làm tràn hoặc kéo toàn bộ trang.
- **Quality**: Bổ sung regression test cho Vùng 1 và Vùng 3 trên mobile.

## 1.9.0 (2026-07-31)
- **Feature**: Hiển thị ba vùng ảnh mô tả sản phẩm trên trang chi tiết.
- Desktop dùng bố cục hai cột; mobile theo thứ tự nội dung đã duyệt.
- Slider 4:3 không crop ảnh và tái sử dụng Xem thêm/Thu gọn hiện có.

## 1.8.8 (2026-07-22)
- **Feature**: Tạm thời vô hiệu hóa phương thức thanh toán VietQR trên giao diện giỏ hàng.
- Files: `components/cart/CartPaymentMethod.tsx`

## 1.8.7 (2026-07-21)
- **Fix**: Popover `+N` giới hạn chiều cao theo viewport và cuộn dọc nội bộ; đồng thời thu gọn khoảng cách giữa highlight và phần chọn màu.
- **Chất lượng**: bổ sung regression test xác nhận chip `+4` mở đầy đủ các CTKM ẩn trong vùng cuộn riêng.

## 1.8.6 (2026-07-21)
- **Fix**: Điều hướng vào trang chi tiết sản phẩm luôn reset tức thời về đầu trang, không còn dừng giữa trang do nhiều smooth-scroll chạy đồng thời.
- **An toàn**: thumbnail ảnh và chip size chỉ cuộn ngang trong rail của chúng, không còn khả năng kéo document theo chiều dọc.
- **Next.js**: khai báo `data-scroll-behavior="smooth"` để framework tạm tắt smooth scroll đúng lúc chuyển route.

## 1.8.5 (2026-07-21)
- **Feature**: PDP hiển thị CTKM vận chuyển, giảm giá hóa đơn và quà tặng; hover/focus/chạm để xem điều kiện, voucher có mã nhập và nút sao chép.
- **Logic**: `BUY_X_GET_Y` chỉ hiện trên đúng sản phẩm cần mua, `BUY_TO_GET_GIFT` hiện toàn cục; quà active hết tồn hiện “Tạm hết quà”, còn hidden/inactive/deleted bị loại.
- **Hiệu năng**: endpoint public riêng dùng projection gọn, batch query không N+1, cache tối đa 30 giây, request coalescing; `Suspense` + timeout 2,5 giây + fail-soft không chặn PDP và bỏ lần fetch Redux trùng sau hydration.
- **UI**: nội dung card không bị cắt, nhãn quà nằm trên rail ngang cuộn nội bộ, không tạo page overflow; đổi nhãn thành “Vận chuyển” và “Khuyến mãi”.
- **Contract & quality**: bổ sung proto/generated types, i18n Việt/Anh cùng test cho UI, parsing, repository, cache resilience, visibility và targeting.

## 1.8.4 (2026-07-20)
- **Feature**: Trong khối **Combo sản phẩm**, dropdown chọn variant (đang hiển thị tên đầy đủ kiểu "Áo kiểu boom cổ đức - Be - S") được thay bằng **swatch màu + chip size** như trang chi tiết sản phẩm, thu nhỏ lại cho vừa cột combo (swatch cỡ như ở card sản phẩm ngoài trang chủ). Áp dụng cho cả ô sản phẩm chính lẫn các ô chọn thêm.
- Trên desktop các ô combo **giãn theo chỗ trống** thay vì cố định 161px như tablet (tối đa 240px/ô, chia đều nên không tràn dù combo có 5 món). Ảnh chuyển từ chiều cao cố định 214px sang `aspect-[3/4]` — vẫn đúng tỉ lệ cũ nhưng lớn lên theo cột, cỡ như card sản phẩm ngoài trang chủ. Swatch màu và chip size cũng phóng to trên desktop (`lg:h-5 lg:w-9` — đúng cỡ swatch ở trang chủ).
- Sản phẩm nhiều màu chỉ hiện **7 swatch đầu** kèm nút chevron bấm để mở rộng, dùng lại đúng cách card sản phẩm ngoài trang chủ đang làm — 7 swatch + nút vừa đúng 2 hàng trong cột combo. Màu đang chọn luôn được hiển thị kể cả khi nằm ngoài 7 cái đầu. Đo trên production: 413/417 sản phẩm có ≤7 màu nên gần như không ai thấy nút này; sản phẩm nhiều nhất có 16 màu, nếu để tràn tự do thì card cao thêm ~145px.
- Hàng size **chỉ hiện size mà màu đang chọn thực sự có**, nên không chọn được tổ hợp không tồn tại. Đổi màu thì giữ nguyên size nếu màu mới có size đó, không thì nhảy về size đầu tiên có hàng.
- **Fix**: logic chọn sản phẩm cho từng ô của combo gộp trước đây **chỉ loại trùng sản phẩm**, không kiểm tra tổ hợp cuối cùng có phải combo thật hay không — nên khách trộn được sản phẩm của 2 combo khác nhau, màn hình hiện giá của combo đầu tiên (sai giá) rồi backend mới báo lỗi lúc thêm vào giỏ. Ngoài ra mỗi ô chỉ nhìn các ô **phía trước** nên kết quả phụ thuộc thứ tự chọn. Nay dùng đúng một quy tắc: *một sản phẩm hợp lệ cho ô này khi tồn tại combo gốc chứa đủ sản phẩm chính + lựa chọn ở mọi ô khác + sản phẩm đó*. Khi lựa chọn mới làm ô khác hết hợp lệ, hệ thống chọn combo giữ lại được **nhiều lựa chọn cũ nhất** rồi mới bỏ phần thừa, thay vì xoá lần lượt từng ô (cách cũ xoá cả những ô vốn vẫn hợp lệ). Logic này trước đây bị chép làm 3 bản không khớp nhau ở `ComboItemCard` và `ComboCard`; nay gộp về `lib/helpers/comboSlotHelper.ts` có unit test, giảm ~90 dòng.
- **Fix**: khi shop tạo **nhiều combo cùng số lượng món** và cùng chứa sản phẩm đang xem, hệ thống gộp chúng lại để khách chọn giữa các sản phẩm thay thế. Nhưng số ô hiển thị đang lấy `Math.max(số món của combo, số sản phẩm gộp được)` — nên gộp 2 combo 4 món chung 3 sản phẩm sẽ ra **4 ô thay vì 3**, mỗi ô bị lấp đầy một sản phẩm khác nhau và dropdown không còn lựa chọn nào. Tệ hơn, `handleAddToCart` lại đếm theo số món thật (3), nên ô thừa bị **bỏ qua âm thầm**. Nay số ô luôn bằng số món của combo.
- **An toàn dữ liệu**: sản phẩm nào không suy ra được cặp (màu, size) duy nhất cho từng SKU thì **tự động giữ nguyên dropdown cũ**. Đo trên dữ liệu production: 2163/2203 sản phẩm (98.18%) tách được, 40 sản phẩm lùi về dropdown cũ — không sản phẩm nào có nguy cơ chọn một đằng ra SKU một nẻo.
- Cặp (màu, size) của mỗi SKU được đọc từ **mã SKU trước, attribute sau**. Lý do: trên production có 5 SKU bị gán sai attribute (ví dụ `14BNS8005AT-đỏ-S` gắn nhãn màu Đen); mã SKU đúng nên đọc theo mã sẽ tự sửa được. Attribute vẫn cần để biết đâu là màu, đâu là size.
- State vẫn là `variantId` như cũ, nên logic ghép combo, lọc liên hoàn và thêm vào giỏ **không đổi**.
- **Fix**: combo trước đây hiển thị cả variant shop không bán được (DISCONTINUED / INACTIVE / OUT_OF_STOCK) trong khi trang chi tiết sản phẩm đã ẩn từ lâu. Nay combo dùng chung bộ lọc `filterActiveVariants` với trang chi tiết, flash-sale và topic.
- **Fix**: size hết hàng nay **gạch chéo và không bấm được**, dùng lại đúng `diagonal-strike` của chip size ở trang chi tiết sản phẩm. Swatch màu hết hàng thì làm mờ thay vì gạch, vì màu được set bằng inline style nên luôn đè mất gradient gạch. Nếu variant mặc định đã hết hàng thì tự nhảy sang variant còn hàng đầu tiên.
- **Feature**: ảnh trong khối combo **đổi theo màu đang chọn** (trước đây luôn cố định ảnh sản phẩm cha). Ảnh lấy theo **màu** chứ không theo variant: trong các SKU cùng màu, ưu tiên SKU có ảnh khác ảnh cha — vì nhiều SKU dùng chung ảnh cha (ví dụ `15FDL8007ST`: chỉ `Hồng-M` có ảnh hồng thật, `Hồng-S`/`Hồng-L` đều trỏ về ảnh chung). Nhờ vậy đổi size thì ảnh đứng yên, chỉ đổi màu mới đổi ảnh.
- **Fix**: khối combo trước đây **không kiểm tra tồn kho ở cấp sản phẩm**, nên sản phẩm mà trang chi tiết đã chặn mua (nút "Thêm vào giỏ" bị disable vì hết hàng) vẫn thêm được qua combo. Ví dụ thật: `24ADL2010ST` (Áo kiểu cổ hoa trai) — 0 variant, tồn kho 0. Nay ô đó hiện "Hết hàng" và chặn, áp dụng cho cả ô sản phẩm chính lẫn các ô chọn thêm.
- **Fix**: sản phẩm cha không còn SKU nào bán được (production đang có 1 trường hợp: `25TNC2014OB` — 35 variant, 0 ACTIVE) trước đây rơi vào trạng thái không hiện dropdown rồi **gửi mã sản phẩm cha lên giỏ** — mà mã cha không phải SKU bán thật bên Nhanh. Nay cũng bị chặn.
- **Fix**: thêm combo vào giỏ hàng trước đây **không có phản hồi gì** — không toast, không popover, chỉ số trên icon giỏ tăng lên (`addComboToCartSaga` chỉ dispatch state, trong khi thêm 1 sản phẩm lẻ thì mở popover thành công). Nay hiện toast "Đã thêm vào giỏ hàng". Chuỗi này được component dịch rồi truyền vào saga và **được lược bỏ trước khi gọi API**, để không lẫn dữ liệu hiển thị vào payload.
- **Fix**: bỏ text tiếng Việt hardcode trong khối combo ("Chọn sản phẩm", "Chọn") — chuyển sang i18n.
- **Fix**: sản phẩm còn variant ACTIVE nhưng **tất cả đều hết hàng** trước đây vẫn thêm vào giỏ được — mọi chip đều bị gạch, không đổi được gì, nhưng nút vẫn ăn. Nay ô đó hiện "Hết hàng", và `handleAddToCart` kiểm tra lại variant đang chọn có còn hàng không trước khi gửi đi. Cần chốt chặn ở FE vì `addComboToCart` phía backend không đọc `inventory` (cả `addToCart` cũng vậy, từ trước tới nay).
- **Fix**: sản phẩm rơi vào nhánh dropdown cũ (không tách được màu/size) trước đây **không được tự sửa variant mặc định hết hàng**, vì việc kiểm tra dựa vào bảng tra vốn rỗng ở nhánh này. Nay đọc thẳng danh sách variant nên đúng cho cả hai nhánh.
- Lưu ý còn lại: backend `addToCart` / `addComboToCart` vẫn **chưa** kiểm tra tồn kho; chốt chặn thật vẫn ở bước thanh toán. Sẽ xử lý ở PR riêng.
- Files: `components/product/ComboVariantSelector.tsx` (mới), `components/product/ComboOptionRow.tsx` (mới), `components/product/ComboItemCard.tsx`, `components/product/ComboProductCard.tsx`, `components/product/ComboCard.tsx`, `components/product/ProductComboSection.tsx`, `lib/helpers/comboVariantHelper.ts` (mới), `lib/helpers/comboSlotHelper.ts` (mới), `test/lib/helpers/comboVariantHelper.test.ts` (mới), `test/lib/helpers/comboSlotHelper.test.ts` (mới), `messages/{vi,en}.json`, `types/gen/shop/shop/combos/combo.ts`

## 1.8.3 (2026-07-20)
- **Feature**: Gallery chi tiết sản phẩm gộp ảnh **tất cả các màu nối tiếp nhau** thành một dải liền mạch. Vuốt hết ảnh màu đang xem là sang thẳng ảnh màu kế tiếp, và khi đó **màu / giá / size / tồn kho tự chuyển theo** đúng màu đang hiển thị. Bấm swatch màu thì nhảy **tức thì** tới ảnh đầu của màu đó (không animate qua các ảnh trung gian); nếu đang xem sẵn ảnh của màu đó thì giữ nguyên vị trí.
- **Thanh thumbnail và hàng chấm tròn chỉ hiển thị ảnh của màu đang xem**, nên không bị dài lê thê khi sản phẩm nhiều màu. Chúng cũng không còn là carousel Embla mà là vùng cuộn thường — bỏ được việc reInit mỗi lần đổi màu vốn gây nháy. Slider giảm từ **5 xuống 2 instance Embla**.
- **Feature**: Thêm **thanh mua hàng ghim đáy màn hình trên mobile**: swatch màu + chip size (cuộn ngang, có vệt mờ báo còn nữa, tự cuộn tới size đang chọn) + "Thêm vào giỏ hàng" + "Mua ngay". Thanh tự ẩn khi khối chọn màu/size/nút mua thật đang trong tầm nhìn và hiện lại khi cuộn qua. Trang tự chừa đúng khoảng trống bằng chiều cao đo được của thanh.
- Widget chat fchat được **đẩy lên trên thanh** khi thanh hiện (mobile), không còn đè lên nút mua. Desktop không đổi.
- Khối chọn màu trên mobile chuyển xuống **dưới tên + mã SP + giá** (trước nằm trên cả tên sản phẩm). Gộp luôn 2 bản mobile/desktop trùng lặp thành một.
- **Fix**: swatch màu kiểu **chấm bi / caro** trên mobile trước đây chỉ hiện một ô nhỏ do `bg-no-repeat` chặn việc lát nền — nay hiển thị đúng.
- Danh sách ảnh **không phụ thuộc màu đang chọn** nữa nên đổi màu không còn mount lại slider và tải lại ảnh — nhanh hơn bản cũ.
- Dọn: bỏ `console.log("aaaa")` sót lại trong logic tính giá flash sale và một biến `outOfStock` không dùng.
- Files: `components/product/ProductDetailClient.tsx`, `components/product/ProductImageSlider.tsx`, `components/product/ProductStickyBar.tsx` (mới), `lib/helpers/variantHelper.ts`, `lib/hooks/useChatWidgetBottomOffset.ts` (mới), `test/lib/helpers/variantHelper.test.ts` (mới)

## 1.8.2 (2026-07-20)
- **Feature**: Mở toàn bộ CTKM cho khách chưa đăng nhập (guest) — **trừ voucher CDP**. Guest giờ mở được sheet "Chọn ưu đãi" để chọn/xóa CTKM Giảm giá hóa đơn tự động và Giảm giá sản phẩm, đồng thời thấy và chọn được quà tặng "Mua X tặng Y" / "Mua để nhận quà" y như khách đã đăng nhập.
- Gỡ dòng nhắc "Vui lòng đăng nhập / đăng ký tài khoản để mở khóa thêm ưu đãi" dưới ô nhập mã (không còn đúng nữa) và xóa key i18n `toUnlockMoreOffers` đã hết dùng.
- Backend **không đổi** — mọi endpoint khuyến mãi vốn đã nhận `userId` optional; chốt chặn duy nhất còn lại là voucher CDP (cần `cdpCustomerId`).
- Files: `components/cart/VoucherSection.tsx`, `components/cart/CartContent.tsx`, `components/cart/CartContentDesktop.tsx`, `components/cart/hooks/useCartContent.ts`, `messages/{vi,en}.json`

## 1.8.1 (2026-07-20)
- **Feature**: Cho phép khách chưa đăng nhập (guest) áp voucher qua ô nhập mã ở giỏ/checkout. Theo yêu cầu vận hành của shop, guest **không** bị chặn bởi tick "Mã dùng 1 lần cho 1 user" — đủ điều kiện đơn hàng là áp được. Giới hạn tổng lượt dùng của mã (`totalUsageLimit`) vẫn áp cho tất cả. Voucher CDP vẫn yêu cầu đăng nhập vì cần `cdpCustomerId`. Sheet "Chọn ưu đãi" (CTKM) vẫn ẩn với guest; guest chỉ xem + xóa được mã đã áp.
- Files: `components/cart/VoucherSection.tsx`, `messages/{vi,en}.json` (FE); `src/shop/promotion/shop-promotion.service.ts` — `applyVoucher` + `applyProductDiscount` (BE)

## 1.8.0 (2026-07-14)
- **Feature**: Route allowlisted NVN product images through `cdn1.mmenu.io/cchat-images/*` behind an environment feature flag
- Internal and production builds enable the CDN loader; staging remains disabled for controlled rollout
- Files: `components/common/ProductImage.tsx`, `lib/utils/cchatImageLoader.ts`, frontend build workflows

## 1.7.98 (2026-07-02)
- **Fix**: Sửa lỗi lệch responsive (lệch dòng/thụt lề) của sản phẩm thứ 3 trở đi trong danh sách combo trên màn hình desktop bằng cách gỡ bỏ border top và padding top khi ở màn hình lớn (`lg`).
- Files: `components/product/ComboCard.tsx`

## 1.7.97 (2026-07-01)
- **Fix**: Nút "thêm nhanh vào giỏ" trên `ProductCard` giờ dò biến thể **không phân biệt hoa/thường** + hỗ trợ separator `-`/`_`, kèm fallback so khớp theo `attributes` — nhất quán với logic trang chi tiết sản phẩm. Trước đó mã SKU của Nhanh lệch hoa/thường (vd option màu `"Kẻ Đen"` vs code `"...-kẻ đen-M"`) khiến `findVariant` trượt → item vào giỏ mất `variantId` → đơn hàng hiển thị thiếu size/màu.
- Files: `components/product/ProductCard.tsx`

## 1.7.96 (2026-05-23)
- **Fix**: Đổi màu viền color swatch khi chưa chọn từ `#FDF7F1` sang `#F39F3C` để hiển thị rõ hơn với swatch màu trắng/sáng
- Files: `components/product/ProductDetailClient.tsx`

## 1.7.95 (2026-05-21)
- **Chore**: add Facebook domain verification to metadata
- Files: `frontend/VERSION.md`

## 1.7.94 (2026-05-14)
- **Fix**: Make checkout email optional in guest order confirmation UI for both desktop cart checkout and mobile confirm page
- Files: `components/cart/ConfirmOrderShippingGuest.tsx`

## 1.7.93 (2026-04-21)
- **Chore**: Disable MemberPromoPopup notification in both entry points (SecondaryNavigation via `useMemberPromoPopup` hook, and MobileMenuDrawer local state)
- Files: `hooks/useMemberPromoPopup.ts`, `components/navigation/MobileMenuDrawer.tsx`

## 1.7.92 (2026-04-21)
- **Chore**: Disable MemberPromoPopup notification in both entry points (SecondaryNavigation via `useMemberPromoPopup` hook, and MobileMenuDrawer local state)
- Files: `hooks/useMemberPromoPopup.ts`, `components/navigation/MobileMenuDrawer.tsx`

## 1.7.89 (2026-04-13)
- fix: resolve combo variant selector controlled/uncontrolled conflict for non-main products


## 1.7.88 (2026-03-12)

- Rm cloudinary

## 1.7.87 (2026-03-12)
- add wss into cicd

## 1.7.86 (2026-03-12)
- change display product detail image by cdn

## 1.7.85
- remove read only

## 1.7.84
- **Fix**: Rapid product unselection now properly triggers checkout session update
- Queue pending selection changes instead of discarding them during debounce window
- When users rapidly click checkboxes (within 100ms), the latest selection state is saved and processed after current API call completes
- Prevents cart state divergence where UI shows items unselected but checkout session still includes them
- Added `pendingSelectionRef` to track queued selection changes
- Modified `processSelectionChange` to recursively process pending selections in finally block
- File: `components/cart/hooks/useCartContent.ts`

## 1.7.83
- **Fix**: Checkout session items cleared when address updated (Buy Now flow)
- **Problem**: When users click "Buy Now" and go to cart/confirm, items were cleared when address form was filled or auto-loaded
- **Root cause**: `updateCheckoutSession` function was sending empty `items: []` array to API
- **Solution**: Modified `updateCheckoutSession` to preserve existing items from checkout session
- Maps `checkoutSession.items` to preserve product/variant/quantity during address/customer updates
- Sends `combos: []` (empty array) to preserve existing combos unchanged (backend preserves them)
- Affects both authenticated users (address auto-load) and guest users (form changes)
- Consistent with existing `handleItemQuantityChange` pattern
- File: `components/cart/hooks/useConfirmOrder.ts`
## 1.7.82
- fix bug button place order are disable in cart desktop page.
## 1.7.81
- **Fix**: Fix shippingPromotion not triggering re-render when navigating from cart preview to cart page
- **Root cause 1**: Race condition in useCartContent between Effect 0 (fetch existing session) and Effect 2 (auto-select items)
  - Effect 2 was calling `upsertCheckoutSession` before Effect 0 completed, overwriting the session's `shippingPromotion`
  - Added `existingSessionFetched` state to ensure Effect 0 completes before Effect 2 runs
- **Root cause 2**: No sync from useConfirmOrder → parent when address is selected
  - `/api/v1/addresses` API fetches user's default address
  - `updateCheckoutSession` updates session with shipping info → backend returns shippingPromotion
  - But the updated session was only stored in useConfirmOrder's internal state, not synced to parent's PaymentDetails
  - Added `onCheckoutSessionUpdate` callback from CartDesktopCheckout → CartContentDesktop
  - useConfirmOrder now notifies parent when session updates (via wrapper function)
- Now shipping discount displays correctly on cart page for authenticated users
- Files: `components/cart/hooks/useCartContent.ts`, `components/cart/hooks/useConfirmOrder.ts`, `components/cart/CartDesktopCheckout.tsx`, `components/cart/CartContentDesktop.tsx`

## 1.7.79
- **Fix**: Display shipping promotion (free shipping discount) on cart page
- Send default shipping address in upsertCheckoutSession to enable backend shipping fee calculation and auto-apply shipping promotion
- Fetch user's default shipping address when authenticated and include it in checkout session request
- Fixed race condition: added Effect 3 to re-trigger checkout calculation when defaultAddress becomes available (address fetch is async)
- Now cart page displays "Giảm phí vận chuyển" when order qualifies for shipping promotion (e.g., orders > 300K)
- Files: `components/cart/hooks/useCartContent.ts`

## 1.7.78
- Password Dialog uses `autoComplete="nope"` (non-standard value Chrome doesn't recognize)
- Desktop search uses `autoComplete="off"`

## 1.7.77
- **Fix**: Browser autofill bug on Password Dialog and Desktop Search Input
- Added `autoComplete` prop to `LabeledTextField` component
- Password Dialog uses `autoComplete="nope"` (non-standard value Chrome doesn't recognize)
- Desktop search uses `autoComplete="off"`
- Files: `components/common/LabeledTextField.tsx`, `components/auth/ChangePasswordDialog.tsx`, `components/navigation/DesktopNavHeader.tsx`

## 1.7.76
- fix wss.

## 1.7.75
- Temporaty disable onepay payment method.

## 1.7.74
- add scan routes

## 1.7.73
- Temporaty disable onepay payment method.
- fix compile

## 1.7.72
- **Fix**: Remove personalized recommendations fetch from SearchOverlay
- When no recently viewed products exist, display "Không có sản phẩm đã xem gần đây" message instead of fetching recommendations API
- Simplifies SearchOverlay by removing unused recommendedProducts state and fetchRecommendations function
- Files: `components/search/SearchOverlay.tsx`, `messages/vi.json`, `messages/en.json`

## 1.7.71
- **Feature**: Add "Recently Viewed" section to SearchOverlay
- Display up to 4 recently viewed products when opening search overlay
- Full product data is stored in localStorage (no API call needed when displaying)
- Products auto-expire after 3 days
- Only fetches recommendations API if no recently viewed products (saves resources)
- Section title changes dynamically: "Đã xem gần đây" for recently viewed, "Kết quả tìm kiếm" for search results
- Works on both mobile and desktop views
- Files: `lib/services/localStorage.ts`, `lib/services/storage.service.ts`, `app/[locale]/products/[id]/ProductDetailContent.tsx`, `components/search/SearchOverlay.tsx`
- fix show discount product

## 1.7.69
- **Fix**: Search page không áp dụng bộ lọc giá mặc định
- Trước đây trang search luôn filter theo giá 50.000-1.500.000₫ dù user không chọn
- Giờ chỉ áp dụng bộ lọc giá khi user chủ động thiết lập qua URL hoặc UI
- Tăng limit từ 12 lên 14 items (2 hàng đầy đủ với 7 items/hàng)
- Files: `hooks/useSearchFilters.ts`, `app/[locale]/search/SearchContent.tsx`

## 1.7.68
- **Fix**: Simplify mobile SearchOverlay product display
- Changed from 2x2 grid carousel with dots pagination to single horizontal scroll row
- Removed `noAspect` prop from ProductCard (now uses default 3:4 aspect ratio)
- Dialog no longer forces full-screen height on mobile, auto-sizes based on content
- Files: `components/search/SearchOverlay.tsx`

## 1.7.67
- fix: fix search products

## 1.7.66
- **Fix**: Sync cart totals between PaymentDetails (left) and ConfirmOrderPlaceButton (right) on desktop
- Desktop cart page had two different totals because `useConfirmOrder` hook used local state instead of external session
- Now prioritizes `externalSession` (from parent) over local `checkoutSession` state
- Ensures both sections display the same total when adding/removing products or applying vouchers
- Files: `components/cart/hooks/useConfirmOrder.ts`

## 1.7.65
- Fix display flash sale price.

## 1.7.64
- **Feature**: Integrate Google Tag Manager (GTM-T2KQCDMV)
- Added GTM script to root layout with afterInteractive strategy
- Added noscript iframe fallback to locale layout body
- Removed Facebook Pixel script (now managed via GTM)
- Files: `app/layout.tsx`, `app/[locale]/layout.tsx`

## 1.7.63
- **Feature**: Thêm trackProductView + gọi khi xem SP detail

## 1.7.62
- **Feature**: Add "Từ khoá nổi bật hôm nay" (Trending Keywords) to SearchOverlay
- Display trending keywords from `/shop/top-keywords` API before user searches
- Click keyword to search, show selected state (black background)
- Toggle click to deselect and clear search
- Single selection only (multiple keywords not supported yet)
- API cached for 5 minutes to reduce calls
- Silent error handling - section hidden if API fails or returns empty
- Files: `components/search/SearchOverlay.tsx`, `lib/repositories/product.repository.ts`

## 1.7.61
- fix border.

## 1.7.60
- **Feature**: Hide "See All" button in Recommendation section on product detail page
- Added `showSeeAll` boolean prop to `TopProducts` component (default: true)
- Pass `showSeeAll={false}` in `RecommendationSection` to hide the button
- Other sections (CrossSellSection, TopicSectionClient) keep showing the button
- Files: `components/product/TopProducts.tsx`, `components/home/RecommendationSection.tsx`

## 1.7.59
- **Feature**: Auto-search with 500ms debounce for both mobile and desktop
- Click on search bar opens SearchOverlay dialog immediately (desktop)
- Search automatically triggers 500ms after user stops typing
- Pressing Enter cancels debounce and searches immediately
- Desktop/tablet now shows recommended products when dialog opens (same as mobile)
- Files: `components/search/SearchOverlay.tsx`, `components/navigation/DesktopNavHeader.tsx`

## 1.7.57
- **Fix**: Remove shipping promotion when cart changes on both cart and confirm pages
- Cart page: Remove shipping promotion when removing item (`handleRemoveItem`)
- Confirm page: Remove shipping promotion when changing quantity (`handleItemQuantityChange`)
- Consistent behavior across all cart modification actions
- Prevents stale shipping discounts from applying to changed order totals
- Files: `components/cart/hooks/useCartContent.ts`, `components/cart/hooks/useConfirmOrder.ts`

## 1.7.56
- **Feature**: Add cross-sell product recommendations to order success page
- Displays "You may also like" section after successful checkout
- Uses `GET /shop/recommendations/cross-sell` API with purchased product IDs
- Added `getCrossSellRecommendations` method to product repository
- Extended `recommendationSlice` with cross-sell state, actions, and selectors
- Added `getCrossSellSaga` with caching to prevent duplicate API calls
- Created `CrossSellSection` component following `RecommendationSection` pattern
- Shows 8 products on desktop, 6 on mobile/tablet
- Includes loading skeleton and hides section when no recommendations
- Primary: fetches order details via `getOrderByNumber` API to get productIds (reliable, works with direct URL access)
- Fallback: uses productIds from localStorage if API fails (for edge cases)
- Files: `lib/repositories/product.repository.ts`, `lib/services/storage.service.ts`, `components/cart/hooks/useConfirmOrder.ts`, `lib/store/slices/recommendationSlice.ts`, `lib/store/sagas/recommendationSaga.ts`, `components/order/CrossSellSection.tsx`, `components/order/OrderSuccessContent.tsx`, `messages/vi.json`, `messages/en.json`

## 1.7.55
- **Fix**: Product Detail page now uses personalized recommendations API
- Replaced category-based product suggestions with personalized recommendations
- Reused existing `RecommendationSection` component from home page
- Removed deprecated `getSuggestedProducts` saga and related state from `productDetailSlice`
- Files: `app/[locale]/products/[id]/ProductDetailContent.tsx`, `lib/store/sagas/productDetailSaga.ts`, `lib/store/slices/productDetailSlice.ts`

## 1.7.54
- **Feature**: Add "Gợi ý sản phẩm" (Suggested Products) section to home page
- Displays personalized product recommendations below topic sections
- Uses existing `getPersonalizedRecommendations` API with lazy loading
- Shows 8 products on desktop, 6 on mobile/tablet
- Includes loading skeleton and hides section when no recommendations available
- Files: `components/home/RecommendationSection.tsx`, `lib/store/slices/recommendationSlice.ts`, `lib/store/sagas/recommendationSaga.ts`, `lib/store/index.ts`, `lib/store/sagas/index.ts`, `app/[locale]/HomeContent.tsx`
