import {INFLUENCER_CARD_TEMPLATE, COVER_SLIDE_TEMPLATE} from './templates';

const SOURCE_TO_FIELD_KEY = {
    profileImageField: 'profileImageFieldId',
    nameField: 'nameFieldId',
    followersField: 'followersFieldId',
    bioField: 'bioFieldId',
    engagementRateField: 'engagementRateFieldId',
    avgLikesField: 'avgLikesFieldId',
    avgCommentsField: 'avgCommentsFieldId',
    statsImageField: 'statsImageFieldId',
};

export function formatFollowers(num) {
    if (num == null) return '';
    const n = Number(num);
    if (isNaN(n)) return String(num);
    if (n >= 1000000) {
        return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M followers';
    }
    if (n >= 1000) {
        return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K followers';
    }
    return n + ' followers';
}

export function formatMetricValue(value, label) {
    if (value == null) return '—';
    const n = Number(value);
    if (isNaN(n)) return String(value);
    const lowerLabel = (label || '').toLowerCase();
    if (lowerLabel.includes('rate')) {
        // If value is already a percentage (e.g. 3.2) show as-is with %
        // If value is a decimal (e.g. 0.032) convert to percentage
        if (n > 0 && n < 1) {
            return (n * 100).toFixed(1) + '%';
        }
        return n.toFixed(1) + '%';
    }
    if (n >= 1000000) {
        return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (n >= 1000) {
        return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return String(n);
}

function getImageUrl(cellValue) {
    if (!cellValue || !Array.isArray(cellValue) || cellValue.length === 0) return null;
    const attachment = cellValue[0];
    if (attachment.thumbnails && attachment.thumbnails.large) {
        return attachment.thumbnails.large.url;
    }
    return attachment.url || null;
}

function getImageFullUrl(cellValue) {
    if (!cellValue || !Array.isArray(cellValue) || cellValue.length === 0) return null;
    const attachment = cellValue[0];
    return attachment.url || null;
}

function getFieldValue(record, fieldId) {
    if (!record || !fieldId) return null;
    return record.getCellValue(fieldId);
}

function getFieldValueAsString(record, fieldId) {
    if (!record || !fieldId) return '';
    const val = record.getCellValueAsString(fieldId);
    return val || '';
}

export function resolveSlideElements(record, fieldMapping) {
    const template = INFLUENCER_CARD_TEMPLATE;
    const resolved = [];

    for (const element of template.elements) {
        if (element.type === 'text') {
            const fieldKey = SOURCE_TO_FIELD_KEY[element.source];
            const fieldId = fieldMapping[fieldKey];
            if (!fieldId) continue;

            let value;
            if (element.format === 'followers') {
                const raw = getFieldValue(record, fieldId);
                value = formatFollowers(raw);
            } else {
                value = getFieldValueAsString(record, fieldId);
            }
            if (!value) continue;

            resolved.push({...element, value});
        } else if (element.type === 'image') {
            const fieldKey = SOURCE_TO_FIELD_KEY[element.source];
            const fieldId = fieldMapping[fieldKey];
            if (!fieldId && element.optional) continue;
            if (!fieldId) continue;

            const cellValue = getFieldValue(record, fieldId);
            const thumbnailUrl = getImageUrl(cellValue);
            const fullUrl = getImageFullUrl(cellValue);
            if (!thumbnailUrl && element.optional) continue;
            if (!thumbnailUrl) continue;

            resolved.push({...element, thumbnailUrl, fullUrl});
        } else if (element.type === 'metrics') {
            const values = element.sources.map((source, i) => {
                const fieldKey = SOURCE_TO_FIELD_KEY[source];
                const fieldId = fieldMapping[fieldKey];
                if (!fieldId) return null;
                const raw = getFieldValue(record, fieldId);
                const formatted = formatMetricValue(raw, element.labels[i]);
                return {label: element.labels[i], value: formatted};
            }).filter(Boolean);

            if (values.length === 0) continue;
            resolved.push({...element, values});
        }
    }

    return resolved;
}

export function resolveCoverElements(coverTitle, coverSubtitle) {
    const template = COVER_SLIDE_TEMPLATE;
    const resolved = [];

    for (const element of template.elements) {
        if (element.source === 'coverTitle' && coverTitle) {
            resolved.push({...element, value: coverTitle});
        } else if (element.source === 'coverSubtitle' && coverSubtitle) {
            resolved.push({...element, value: coverSubtitle});
        }
    }

    return resolved;
}
