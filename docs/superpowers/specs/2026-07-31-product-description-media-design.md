# Thiết kế hình ảnh cho phần mô tả sản phẩm

**Ngày:** 2026-07-31
**Trạng thái:** Đã được duyệt
**Phạm vi:** Backend Product/API, CMS Cài đặt hiển thị website và trang chi tiết sản phẩm storefront

## 1. Mục tiêu

Mở rộng phần cài đặt hiển thị website của từng sản phẩm với ba vùng hình ảnh tùy chọn:

1. Vùng 1: ảnh phía trên Tên sản phẩm và bảng Chi tiết sản phẩm.
2. Vùng 2: cụm ảnh có thứ tự, hiển thị dưới dạng slider bên phải bảng Chi tiết sản phẩm trên desktop.
3. Vùng 3: ảnh dài phía dưới Chi tiết sản phẩm và phía trên nội dung Mô tả sản phẩm.

Tên sản phẩm đa ngôn ngữ, các trường Chi tiết sản phẩm đa ngôn ngữ, nội dung Mô tả sản phẩm đa ngôn ngữ, Hướng dẫn chọn size và hành vi Xem thêm/Thu gọn hiện có phải được giữ nguyên.

## 2. Các quyết định nghiệp vụ đã chốt

- Ba vùng ảnh dùng chung cho website tiếng Việt và tiếng Anh.
- Vùng 1 hiện tại cho phép cấu hình một ảnh trên CMS.
- Vùng 2 không giới hạn số lượng ảnh.
- Vùng 2 hỗ trợ upload nhiều ảnh, xóa từng ảnh và kéo-thả sắp xếp.
- Vùng 3 hiện tại cho phép cấu hình một ảnh trên CMS.
- Mỗi file ảnh tuân theo giới hạn upload hiện có:
  - Định dạng PNG, JPG/JPEG, GIF hoặc WEBP.
  - Tối đa 10 MB cho mỗi file.
- Vùng 2 hiển thị trong khung tỷ lệ 4:3 với `object-fit: contain`, không cắt ảnh.
- Vùng 1 và Vùng 3 giữ tỷ lệ gốc.
- Tái sử dụng hành vi Xem thêm/Thu gọn và các key dịch `productDetail.expand`, `productDetail.collapse` hiện có.
- Không bắt buộc migration dữ liệu cho sản phẩm cũ.

## 3. Quyết định kiến trúc

Lưu một object media nhúng, tùy chọn, trong Product:

```typescript
interface ProductDescriptionMedia {
  topImages: string[];
  sliderImages: string[];
  bottomImages: string[];
}
```

Protobuf tương ứng sử dụng repeated string:

```proto
message ProductDescriptionMedia {
  repeated string top_images    = 1;
  repeated string slider_images = 2;
  repeated string bottom_images = 3;
}
```

`Product.descriptionMedia` và `UpdateProductDetailsRequest.descriptionMedia` là các field optional.

CMS hiện chỉ cung cấp uploader một ảnh cho Vùng 1 và Vùng 3, nhưng dữ liệu được lưu dưới dạng mảng ngay từ đầu:

- Thêm hoặc thay Vùng 1: `topImages = [uploadedUrl]`.
- Xóa Vùng 1: `topImages = []`.
- Thêm hoặc thay Vùng 3: `bottomImages = [uploadedUrl]`.
- Xóa Vùng 3: `bottomImages = []`.
- Storefront hiện chỉ đọc `topImages[0]` và `bottomImages[0]`.

Thiết kế này cho phép Vùng 1 hoặc Vùng 3 hỗ trợ nhiều ảnh sau này mà không đổi kiểu dữ liệu, API contract hoặc migration. Nếu cần một vùng hoàn toàn mới, hệ thống vẫn phải bổ sung field optional và component hiển thị tương ứng; phạm vi này không xây dựng page builder tổng quát.

### Các phương án không chọn

1. Ba field top-level trong Product không được chọn vì sẽ phân tán một nhóm chức năng thống nhất trong Product model vốn đã lớn.
2. Collection/module Product Content riêng không được chọn vì tạo thêm relation, endpoint, xử lý nhất quán và request mạng trong khi nội dung hiện tại không cần quản trị độc lập.

## 4. Thiết kế API và persistence

### 4.1 Endpoint hiện tại

Tiếp tục sử dụng:

```http
PATCH /products/:id/details
```

Ví dụ request:

```json
{
  "descriptionMedia": {
    "topImages": ["https://cdn.example.com/top.webp"],
    "sliderImages": [
      "https://cdn.example.com/detail-1.webp",
      "https://cdn.example.com/detail-2.webp"
    ],
    "bottomImages": ["https://cdn.example.com/bottom.webp"]
  }
}
```

Response vẫn là Product sau khi cập nhật.

### 4.2 Validation

- `descriptionMedia` là optional và được validate bằng nested DTO.
- Mỗi field vùng ảnh là optional trong request để giữ semantics partial update.
- Mỗi vùng được gửi lên phải là array.
- Mỗi phần tử phải là string, tối đa 2.048 ký tự.
- Không giới hạn độ dài mảng.
- Mảng rỗng là hợp lệ và có nghĩa vùng đó không có ảnh.
- Khi lưu tab Cài đặt hiển thị website, CMS luôn gửi đủ cả ba mảng để thao tác xóa rõ ràng và xác định.
- Backend không giới hạn `topImages` hoặc `bottomImages` chỉ có một phần tử; đây là chủ đích để hỗ trợ mở rộng sau này.

### 4.3 Quy tắc cập nhật persistence

- Không gửi `descriptionMedia`: giữ nguyên media hiện có.
- Có gửi một mảng vùng ảnh: thay thế toàn bộ mảng đã lưu của vùng đó, bao gồm thứ tự.
- Mảng rỗng được lưu nguyên dạng. Repository không tự unset object, bảo đảm Save rồi reload có kết quả xác định.
- Sản phẩm cũ có thể chưa có `descriptionMedia`; generated client và UI state normalize trường hợp này thành ba mảng rỗng.
- Thứ tự hiển thị chính là thứ tự mảng, không có field `displayOrder` riêng.
- Media được cập nhật trong cùng MongoDB update với các website settings hiện tại.
- Upload file chưa cập nhật Product; chỉ nút Lưu mới gửi media state vào Product.

### 4.4 Lan truyền Product model

Field mới phải được lan truyền nhất quán qua:

- Shared product proto và CMS update-request proto.
- Generated TypeScript protobuf types của CMS và storefront.
- Backend domain entity.
- Mongoose Product schema.
- Product mapper hai chiều.
- Chữ ký abstract Product repository.
- Mongoose repository update implementation.
- Chữ ký Product service.
- Controller mapping DTO sang service.

### 4.5 Query projection

`descriptionMedia` là dữ liệu chỉ dành cho trang chi tiết:

- Response chi tiết sản phẩm CMS/shop có field này.
- Product listing projection loại field này cùng `descriptionLocalization`, `detailsLocalization` và `sizeGuide`.
- Export projection loại field này.
- Không tạo search index hoặc database index cho các mảng URL.

## 5. Thiết kế CMS

### 5.1 Vị trí

Thêm section đa ngôn ngữ “Hình ảnh mô tả sản phẩm” / “Product description images” trong tab Cài đặt hiển thị website, sau Hướng dẫn chọn size và trước Chi tiết sản phẩm.

Nút Lưu hiện tại vẫn là ranh giới lưu dữ liệu: một lần lưu cập nhật tên đa ngôn ngữ, size guide, chi tiết, badge, mô tả rich text và description media.

### 5.2 Ranh giới component

Giữ main tab là nơi điều phối form và tách component theo trách nhiệm:

```text
cms/src/sections/product-detail/
├── product-website-settings-tab.tsx
└── components/
    ├── product-description-media-section.tsx
    ├── single-description-image-upload.tsx
    ├── sortable-description-gallery.tsx
    └── sortable-description-image-item.tsx
```

Trách nhiệm:

- `product-website-settings-tab.tsx`
  - Khởi tạo `descriptionMedia` state từ Product.
  - Normalize các mảng không tồn tại thành `[]`.
  - Thêm `descriptionMedia` vào save payload hiện tại.
- `product-description-media-section.tsx`
  - Cung cấp label, layout, helper text và callback thay đổi state.
  - Không chứa Redux hoặc upload repository logic.
- `single-description-image-upload.tsx`
  - Giao tiếp với parent bằng một URL.
  - Tái sử dụng upload action và giới hạn file hiện có.
  - Thay ảnh trả URL mới; xóa ảnh trả giá trị rỗng.
- `sortable-description-gallery.tsx`
  - Nhận `images: string[]` và `onChange(images: string[])`.
  - Dispatch multiple-file upload action hiện có.
  - Nối các URL upload thành công vào cuối danh sách hiện có.
  - Quản lý DnD context và danh sách ảnh có thứ tự.
- `sortable-description-image-item.tsx`
  - Render thumbnail, drag handle, số thứ tự và nút xóa của một ảnh.

### 5.3 Hành vi từng vùng

Vùng 1:

- Khi rỗng, hiển thị drop zone một ảnh.
- Khi có ảnh, hiển thị preview và thao tác thay/xóa.
- Ghi `[url]` hoặc `[]` vào `topImages`.

Vùng 2:

- Chấp nhận một hoặc nhiều file trong mỗi lần chọn/thả.
- Không giới hạn tổng số ảnh.
- Hiển thị thumbnail có thứ tự.
- Hỗ trợ kéo-thả bằng chuột, cảm ứng và bàn phím.
- Reorder cập nhật local form state ngay lập tức.
- Xóa một ảnh chỉ cập nhật local form state, không xóa object đã upload khỏi storage.
- Ảnh mới được nối vào cuối thứ tự hiện có.

Vùng 3:

- Hành vi giống Vùng 1.
- Ghi `[url]` hoặc `[]` vào `bottomImages`.

### 5.4 Loading và lỗi

- Disable Lưu khi có media đang upload.
- Disable uploader đang thực hiện upload.
- Dùng loading indicator hiện có.
- Upload lỗi không được thêm URL vào local state.
- Các URL đã lưu phải giữ nguyên sau upload lỗi.
- Hiển thị lỗi bằng global error/toast flow hiện có.
- Multiple upload hiện dùng semantics all-or-nothing; nếu luồng này lỗi thì không cập nhật một phần gallery.
- Rời trang sau khi upload nhưng trước khi Lưu có thể để lại file chưa được Product tham chiếu, giống luồng size guide/banner hiện tại. Garbage collection file nằm ngoài phạm vi feature.

### 5.5 i18n và styling CMS

- Tái sử dụng key dịch hiện có cho action và upload label chung.
- Chỉ thêm key đặc thù media sau khi tìm trong cả hai locale file.
- Đồng bộ key tiếng Việt và tiếng Anh.
- Dùng MUI `sx` và theme.
- Không thêm CSS file hoặc hard-code user-facing text.
- Mỗi file phải dưới giới hạn 500 dòng của CMS.

## 6. Thiết kế storefront

### 6.1 Ranh giới component

Tách `ProductDescription` đang gộp nhiều trách nhiệm thành:

```text
frontend/components/product/product-description/
├── ProductDescriptionSection.tsx
├── ProductDetailSpecs.tsx
├── ProductDescriptionGallery.tsx
├── ProductDescriptionMediaImage.tsx
└── ProductRichDescription.tsx
```

Trách nhiệm:

- `ProductDescriptionSection`: điều phối bố cục responsive và điều kiện hiển thị.
- `ProductDetailSpecs`: render tên, mã và các trường Chi tiết sản phẩm đã localize.
- `ProductDescriptionGallery`: quản lý Embla carousel, arrows, dots, swipe và current index.
- `ProductDescriptionMediaImage`: render Vùng 1 hoặc Vùng 3 theo tỷ lệ gốc và alt text.
- `ProductRichDescription`: giữ nguyên render HTML đã sanitize và hành vi Xem thêm/Thu gọn hiện tại.

`ProductDetailClient` truyền Product cùng tên, chi tiết và mô tả đã resolve locale vào section, không nhân đôi responsive markup.

### 6.2 Thứ tự desktop

```text
Tiêu đề Mô tả sản phẩm
Grid hai cột:
  Trái: Vùng 1, sau đó Tên/Mã/Chi tiết sản phẩm
  Phải: slider Vùng 2
Vùng 3 full width
Nội dung Mô tả sản phẩm đa ngôn ngữ
Xem thêm / Thu gọn hiện có
```

- Cột gallery lớn hơn cột thông số theo hình Coolmate tham chiếu.
- Nếu thiếu Vùng 2, nội dung bên trái dùng chiều rộng phù hợp và không để cột trống.

### 6.3 Thứ tự mobile

```text
Tiêu đề Mô tả sản phẩm
Vùng 1
Slider Vùng 2
Tên, mã và Chi tiết sản phẩm
Vùng 3
Nội dung Mô tả sản phẩm đa ngôn ngữ
Xem thêm / Thu gọn hiện có
```

Chỉ dùng một component tree với CSS Grid/Flex responsive order, không duy trì hai bản nội dung desktop/mobile.

### 6.4 Hành vi gallery

- Tái sử dụng Embla Carousel đã cài.
- Khung tỷ lệ 4:3 ổn định để tránh layout shift.
- Dùng `object-fit: contain`.
- Hỗ trợ swipe trên thiết bị cảm ứng.
- Hiện previous/next trên desktop khi có nhiều hơn một ảnh.
- Hiện dots hoặc chỉ báo vị trí khi có nhiều hơn một ảnh.
- Ẩn toàn bộ navigation khi chỉ có một ảnh.
- Lazy-load các ảnh không phải slide đầu.
- Giữ đúng thứ tự mảng từ CMS.

### 6.5 Render ảnh và accessibility

- Vùng 1 và Vùng 3 responsive, chiếm toàn chiều rộng container và giữ tỷ lệ gốc.
- Alt text dùng tên sản phẩm theo locale hiện tại, kết hợp nội dung media-purpose đã dịch khi cần.
- Không thêm external image-host config chỉ cho feature này; đi theo pattern product/CDN image hiện có.
- Gallery có tỷ lệ cố định. Vùng 1/3 dùng intrinsic dimensions khi có hoặc responsive image pattern hiện có.

### 6.6 Conditional rendering

- Thiếu Vùng 1: bỏ qua và đưa nội dung sau lên.
- Thiếu Vùng 2: bỏ gallery và cột desktop trống.
- Thiếu Vùng 3: Mô tả sản phẩm nối tiếp nội dung trước.
- Thiếu rich-text description: ẩn nội dung và nút Xem thêm/Thu gọn.
- Thiếu specs nhưng có media: vẫn hiển thị media hợp lệ, không tạo bảng rỗng.
- Thiếu toàn bộ `descriptionMedia`: giữ trải nghiệm trang chi tiết hiện tại, không lỗi hoặc tạo khoảng trắng media.
- Nếu `topImages` hoặc `bottomImages` có nhiều phần tử, UI hiện tại chỉ dùng phần tử đầu; các phần tử sau được giữ để hỗ trợ mở rộng.

### 6.7 Xem thêm/Thu gọn

Không tạo implementation mới. Di chuyển state, transition, button và translation key hiện tại vào `ProductRichDescription` mà không thay đổi hành vi người dùng.

## 7. Luồng dữ liệu

### CMS

```text
GET Product
→ normalize descriptionMedia thiếu thành ba mảng []
→ upload/reorder/chỉnh local form state
→ nhấn Lưu
→ PATCH /products/:id/details với ba mảng descriptionMedia đầy đủ
→ backend validate và thay các mảng trong một lần update
→ Product response cập nhật Redux currentProduct
```

### Storefront

```text
GET Product detail
→ generated Product type chứa descriptionMedia
→ localization helper resolve tên/chi tiết/rich text như hiện tại
→ ProductDescriptionSection ghép media và text theo điều kiện
→ Embla đọc sliderImages theo thứ tự đã lưu
```

## 8. Bảo mật và ràng buộc vận hành

- Tiếp tục dùng endpoint CMS có authentication và product-management permission hiện tại.
- Product endpoint chỉ lưu URL từ file service, không nhận binary upload.
- Giữ nguyên rich-text sanitization; media không thay đổi đường đi này.
- Không tạo HTML injection path từ URL ảnh.
- Không log toàn bộ media array hoặc nội dung upload.
- Không migration ghi lại toàn bộ Product.
- Không thêm dependency.
- Không thay luồng đồng bộ Nhanh/Shopify; field CMS-only mới phải được giữ qua các lần sync như website fields hiện có.

## 9. Chiến lược test

### Backend

- DTO chấp nhận không có `descriptionMedia`.
- DTO chấp nhận mảng rỗng.
- DTO chấp nhận nhiều slider URL theo thứ tự.
- DTO từ chối giá trị vùng ảnh không phải array.
- DTO từ chối phần tử không phải string.
- DTO từ chối URL dài hơn 2.048 ký tự.
- Service truyền media mà không ảnh hưởng HTML sanitization.
- Repository thay đúng các mảng được gửi và giữ media khi object không được gửi.
- Mapper round-trip đủ ba mảng và xử lý field cũ không tồn tại.
- Product detail response chứa media.
- Product list/export projection không chứa media.
- Test update-details hiện có vẫn pass.

### CMS

- Product không có media khởi tạo thành ba mảng rỗng.
- Media hiện có render đúng trong ba control.
- Vùng 1 thêm/thay/xóa tạo `[url]`/`[]`.
- Vùng 3 thêm/thay/xóa tạo `[url]`/`[]`.
- Multiple gallery upload nối URL theo thứ tự kết quả.
- Xóa gallery chỉ xóa đúng URL được chọn.
- Kéo-thả cập nhật đúng thứ tự mảng.
- Save payload chứa đủ ba mảng theo thứ tự hiện tại.
- Disable Save trong khi upload.
- Upload lỗi không thay đổi các URL hiện có.
- Tên, badge, size guide, details và description hiện tại vẫn lưu đúng.

### Storefront

- Desktop render đúng tiêu đề, grid hai cột, Vùng 3 và rich text.
- Mobile render đúng thứ tự đã duyệt.
- Thiếu media object không gây lỗi.
- Thiếu từng vùng không để container rỗng.
- Một gallery image không hiện arrows/dots.
- Nhiều ảnh hiện navigation và giữ đúng thứ tự.
- Gallery dùng contain trong khung 4:3.
- Vùng 1/3 dùng phần tử đầu.
- Alt ảnh dùng tên sản phẩm theo locale.
- Giữ/move test Xem thêm/Thu gọn hiện tại.
- Thiếu description thì ẩn nút Xem thêm/Thu gọn.

### Regression

- Backend: lint, targeted product tests, full tests và build.
- CMS: targeted website-settings tests, formatting check và build.
- Storefront: targeted product-description tests, lint, full test command nếu có và build.
- Manual responsive ở mobile, tablet và desktop.
- Manual CMS cho upload, thay, xóa, multi-upload, reorder, save, reload và đổi locale.

## 10. Release và tương thích

- Đây là API addition optional, tương thích ngược.
- Deploy backend trước hoặc cùng generated clients.
- CMS/frontend cũ bỏ qua response field mới.
- CMS/frontend mới chấp nhận sản phẩm cũ chưa có field.
- Không cần database backfill.
- Tuân thủ version file và changelog rule của từng ứng dụng.
- Rollback CMS/frontend an toàn vì client cũ chỉ không dùng field optional đã lưu.

## 11. Tiêu chí nghiệm thu

1. CMS có thể cấu hình, thay, xóa và lưu ảnh Vùng 1/3.
2. CMS có thể upload không giới hạn số ảnh Vùng 2, xóa từng ảnh và lưu thứ tự kéo-thả.
3. Mỗi upload tuân thủ định dạng hiện có và tối đa 10 MB/file.
4. Desktop/mobile render đúng thứ tự đã duyệt.
5. Vùng 2 không crop ảnh.
6. Website Việt/Anh dùng chung ảnh nhưng giữ text theo locale.
7. Xem thêm/Thu gọn được tái sử dụng, không regression hành vi/copy.
8. Sản phẩm không có media mới vẫn render bình thường.
9. Product listing/export payload không tăng theo media.
10. Size guide, details, description, badge, sync, listing và product detail hiện có vượt qua regression verification.
