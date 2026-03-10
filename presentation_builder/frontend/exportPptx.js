import PptxGenJS from 'pptxgenjs';
import {SLIDE_WIDTH, SLIDE_HEIGHT} from './templates';
import {resolveSlideElements, resolveCoverElements} from './slideRenderer';

async function fetchImageAsBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function addTextElement(slide, element) {
    const opts = {
        x: element.x,
        y: element.y,
        w: element.w,
        h: element.h,
        fontSize: element.fontSize || 14,
        bold: element.bold || false,
        color: element.color || '000000',
        align: element.align || 'left',
        valign: element.align === 'center' ? 'middle' : 'top',
        wrap: true,
    };
    slide.addText(element.value, opts);
}

function addMetricsElement(slide, element) {
    const text = element.values
        .map(m => m.label + ': ' + m.value)
        .join('    |    ');
    slide.addText(text, {
        x: element.x,
        y: element.y,
        w: element.w,
        h: element.h,
        fontSize: element.fontSize || 12,
        color: element.color || '444444',
        align: 'center',
        valign: 'middle',
    });
}

async function addImageElement(slide, element) {
    try {
        const dataUrl = await fetchImageAsBase64(element.fullUrl || element.thumbnailUrl);
        slide.addImage({
            data: dataUrl,
            x: element.x,
            y: element.y,
            w: element.w,
            h: element.h,
        });
    } catch (err) {
        console.warn('Failed to load image, skipping:', err);
    }
}

export async function exportPresentation({records, fieldMapping, coverEnabled, coverTitle, coverSubtitle, tableName}) {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_4x3';
    pptx.defineLayout({name: 'CUSTOM', width: SLIDE_WIDTH, height: SLIDE_HEIGHT});
    pptx.layout = 'CUSTOM';

    // Cover slide
    if (coverEnabled) {
        const coverElements = resolveCoverElements(coverTitle || 'Presentation', coverSubtitle || '');
        const slide = pptx.addSlide();
        for (const element of coverElements) {
            addTextElement(slide, element);
        }
    }

    // Record slides
    if (records) {
        for (const record of records) {
            const elements = resolveSlideElements(record, fieldMapping);
            const slide = pptx.addSlide();

            for (const element of elements) {
                if (element.type === 'text') {
                    addTextElement(slide, element);
                } else if (element.type === 'metrics') {
                    addMetricsElement(slide, element);
                } else if (element.type === 'image') {
                    await addImageElement(slide, element);
                }
            }
        }
    }

    const fileName = (coverTitle || tableName || 'Presentation').replace(/[^a-zA-Z0-9 _-]/g, '') + '_presentation';
    await pptx.writeFile({fileName});
}
