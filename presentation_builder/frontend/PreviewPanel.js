import React, {useState, useMemo, useRef, useEffect} from 'react';
import {Box, Text, Button} from '@airtable/blocks/ui';
import {SLIDE_WIDTH, SLIDE_HEIGHT} from './templates';
import {resolveSlideElements, resolveCoverElements} from './slideRenderer';

function SlideElement({element, scale}) {
    const style = {
        position: 'absolute',
        left: element.x * scale,
        top: element.y * scale,
        width: element.w * scale,
        height: element.h * scale,
        overflow: 'hidden',
    };

    if (element.type === 'text') {
        return (
            <div style={{
                ...style,
                fontSize: (element.fontSize || 14) * scale / 72,
                fontWeight: element.bold ? 'bold' : 'normal',
                color: element.color ? '#' + element.color : '#000000',
                textAlign: element.align || 'left',
                display: 'flex',
                alignItems: element.align === 'center' ? 'center' : 'flex-start',
                lineHeight: 1.3,
                wordBreak: 'break-word',
            }}>
                <span>{element.value}</span>
            </div>
        );
    }

    if (element.type === 'image') {
        return (
            <div style={style}>
                <img
                    src={element.thumbnailUrl}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4,
                    }}
                />
            </div>
        );
    }

    if (element.type === 'metrics') {
        return (
            <div style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                gap: 16 * scale / 72,
                fontSize: (element.fontSize || 12) * scale / 72,
                color: element.color ? '#' + element.color : '#444444',
            }}>
                {element.values.map((metric, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1,
                        borderRight: i < element.values.length - 1 ? '1px solid #ddd' : 'none',
                        paddingRight: i < element.values.length - 1 ? 8 : 0,
                    }}>
                        <span style={{fontWeight: 'bold', fontSize: '1.1em'}}>{metric.value}</span>
                        <span style={{fontSize: '0.85em', opacity: 0.7}}>{metric.label}</span>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

export function PreviewPanel({records, fieldMapping, coverEnabled, coverTitle, coverSubtitle}) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(500);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const hasRequiredFields = fieldMapping.nameFieldId && fieldMapping.followersFieldId &&
        fieldMapping.bioFieldId && fieldMapping.profileImageFieldId;

    const slides = useMemo(() => {
        const result = [];
        if (coverEnabled) {
            result.push({
                type: 'cover',
                elements: resolveCoverElements(coverTitle || 'Presentation', coverSubtitle || ''),
            });
        }
        if (records && hasRequiredFields) {
            for (const record of records) {
                result.push({
                    type: 'card',
                    elements: resolveSlideElements(record, fieldMapping),
                    record,
                });
            }
        }
        return result;
    }, [records, fieldMapping, coverEnabled, coverTitle, coverSubtitle, hasRequiredFields]);

    // Clamp slide index when slides change
    useEffect(() => {
        if (currentSlideIndex >= slides.length && slides.length > 0) {
            setCurrentSlideIndex(slides.length - 1);
        }
    }, [slides.length, currentSlideIndex]);

    const scale = containerWidth / SLIDE_WIDTH;
    const slideHeight = (containerWidth / SLIDE_WIDTH) * SLIDE_HEIGHT;
    const currentSlide = slides[currentSlideIndex];

    if (!hasRequiredFields) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Text textColor="light" size="large">
                    Map all required fields to see the preview
                </Text>
            </Box>
        );
    }

    if (slides.length === 0) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Text textColor="light" size="large">
                    No records found
                </Text>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" height="100%" padding={2}>
            <Box
                ref={containerRef}
                flex="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
            >
                <div style={{
                    position: 'relative',
                    width: containerWidth,
                    height: slideHeight,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    borderRadius: 4,
                    overflow: 'hidden',
                }}>
                    {currentSlide && currentSlide.elements.map((element, i) => (
                        <SlideElement key={i} element={element} scale={scale} />
                    ))}
                </div>
            </Box>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                paddingTop={2}
                style={{gap: 12}}
            >
                <Button
                    size="small"
                    icon="chevronLeft"
                    aria-label="Previous slide"
                    onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                    disabled={currentSlideIndex === 0}
                />
                <Text size="default">
                    Slide {currentSlideIndex + 1} of {slides.length}
                </Text>
                <Button
                    size="small"
                    icon="chevronRight"
                    aria-label="Next slide"
                    onClick={() => setCurrentSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                    disabled={currentSlideIndex === slides.length - 1}
                />
            </Box>
        </Box>
    );
}
