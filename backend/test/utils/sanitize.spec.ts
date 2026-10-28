import { sanitizeRichText } from '../../src/utils/sanitize';

describe('sanitizeRichText', () => {
  it('keeps Facebook plugin iframes', () => {
    const html = sanitizeRichText(`
      <iframe
        src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fexample%2Fvideos%2F123"
        width="560"
        height="315"
        style="border:none;overflow:hidden"
        scrolling="no"
        frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowfullscreen="true"
        allowtransparency="true"
        loading="lazy"
        title="Facebook video"
      ></iframe>
    `);

    expect(html).toContain('src="https://www.facebook.com/plugins/video.php');
    expect(html).toContain('style="border:none;overflow:hidden"');
    expect(html).toContain('allowtransparency="true"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('title="Facebook video"');
  });

  it('keeps saved Facebook iframe markup from the CMS editor', () => {
    const html = sanitizeRichText(
      '<div data-facebook-video=""><iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1090963816321177&show_text=false&width=640" width="640" height="360" scrolling="no" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen="true" style="border-width: medium; border-style: none; border-color: currentcolor; border-image: initial; overflow: hidden;"></iframe></div>',
    );

    expect(html).toContain('data-facebook-video');
    expect(html).toContain('src="https://www.facebook.com/plugins/video.php');
    expect(html).toContain('href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1090963816321177');
    expect(html).toContain('show_text=false');
    expect(html).toContain('width=640');
    expect(html).toContain('border-width:medium');
    expect(html).toContain('border-style:none');
    expect(html).toContain('border-color:currentcolor');
    expect(html).toContain('border-image:initial');
    expect(html).toContain('overflow:hidden');
  });

  it('keeps responsive Facebook reel markup from the CMS editor', () => {
    const html = sanitizeRichText(
      '<div data-facebook-video="" style="position: relative; width: 100%; max-width: 640px; aspect-ratio: 9 / 16; overflow: hidden; margin: 8px 0px;"><iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1090963816321177&show_text=false&width=640" scrolling="no" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen="true" style="position: absolute; inset: 0px; width: 100%; height: 100%; border: none; overflow: hidden;"></iframe></div><p></p>',
    );

    expect(html).toContain('data-facebook-video');
    expect(html).toContain('position:relative');
    expect(html).toContain('width:100%');
    expect(html).toContain('max-width:640px');
    expect(html).toContain('aspect-ratio:9 / 16');
    expect(html).toContain('margin:8px 0px');
    expect(html).toContain('src="https://www.facebook.com/plugins/video.php');
    expect(html).toContain('position:absolute');
    expect(html).toContain('inset:0px');
    expect(html).toContain('height:100%');
    expect(html).toContain('border:none');
    expect(html).toContain('overflow:hidden');
  });

  it('keeps another variation of vertical Facebook video', () => {
    const html = sanitizeRichText(
      '<div data-facebook-video="" style="width:360px;max-width:100%;aspect-ratio:9/16;overflow:hidden;margin:16px auto;"><iframe src="https://www.facebook.com/plugins/video.php?href=some-reel-url" width="360" height="640"></iframe></div>',
    );

    expect(html).toContain('data-facebook-video');
    expect(html).toContain('aspect-ratio:9/16');
    expect(html).toContain('width:360px');
    expect(html).toContain('height="640"');
  });

  it('keeps Facebook SDK video attributes from the official embed docs', () => {
    const html = sanitizeRichText(`
      <div
        class="fb-video"
        data-href="https://www.facebook.com/FacebookDevelopers/posts/10151471074398553"
        data-width="500"
        data-allowfullscreen="true"
        data-autoplay="true"
        data-lazy="true"
        data-show-text="false"
        data-show-captions="true"
      ></div>
    `);

    expect(html).toContain('class="fb-video"');
    expect(html).toContain(
      'data-href="https://www.facebook.com/FacebookDevelopers/posts/10151471074398553"',
    );
    expect(html).toContain('data-width="500"');
    expect(html).toContain('data-allowfullscreen="true"');
    expect(html).toContain('data-autoplay="true"');
    expect(html).toContain('data-lazy="true"');
    expect(html).toContain('data-show-text="false"');
    expect(html).toContain('data-show-captions="true"');
  });

  it('keeps Facebook iframe aliases used by copied embeds', () => {
    const html = sanitizeRichText(
      '<iframe src="https://web.facebook.com/plugins/post.php?href=https%3A%2F%2Ffacebook.com%2Fexample%2Fposts%2F123"></iframe>',
    );

    expect(html).toContain('src="https://web.facebook.com/plugins/post.php');
  });

  it('removes iframe from unapproved hostnames', () => {
    const html = sanitizeRichText(
      '<iframe src="https://example.com/embed"></iframe><p>content</p>',
    );

    expect(html).not.toContain('<iframe');
    expect(html).toContain('<p>content</p>');
  });
});
