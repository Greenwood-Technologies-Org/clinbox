"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  value?: string; // The value/benefit description shown in light text
  targetView?: "email" | "calendar" | "docs" | "workflows" | "workflowsettings";
  targetSelector?: string;
  action?: () => void; // Optional action to perform
  position?: "top" | "bottom" | "left" | "right" | "center";
  waitForElement?: boolean; // Whether to wait for element to appear
  advanceOnTargetClick?: boolean; // Require clicking target element to advance
}

interface TutorialDriverProps {
  steps: TutorialStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  isActive: boolean;
  onClose: () => void;
  activeView: "email" | "calendar" | "docs" | "workflows" | "workflowsettings";
  onViewChange?: (
    view: "email" | "calendar" | "docs" | "workflows" | "workflowsettings"
  ) => void;
  onAction?: (actionId: string, step: TutorialStep) => void;
}

export default function TutorialDriver({
  steps,
  onComplete,
  onSkip,
  isActive,
  onClose,
  activeView,
  onViewChange,
  onAction,
}: TutorialDriverProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    top: number | string;
    left: number | string;
    transform?: string;
  } | null>(null);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [waitingForTargetClick, setWaitingForTargetClick] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = steps[currentStepIndex];

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      onComplete?.();
      onClose();
      return prev;
    });
  }, [steps.length, onComplete, onClose]);

  const handlePrevious = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // Calculate smart positioning for the tutorial card
  const calculateCardPosition = useCallback(
    (rect: DOMRect | null, position: string = "bottom") => {
      if (!rect) {
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      }

      // Get actual card width if available, otherwise use max-width
      const actualCardWidth = cardRef.current?.offsetWidth || 448;
      const padding = 20;
      const topSafePadding = 80; // keep card below browser/toolbar area
      const bottomSafePadding = 20;
      const maxUsableWidth = Math.max(200, window.innerWidth - padding * 2);
      const cardWidth = Math.min(actualCardWidth, maxUsableWidth);
      const cardHeight = Math.min(
        cardRef.current?.offsetHeight || 300,
        window.innerHeight - (topSafePadding + bottomSafePadding)
      ); // Ensure it fits vertically too
      const spacing = 20;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top: number | string = 0;
      let left: number | string = 0;
      let transform = "";

      // Helper to ensure card fits horizontally - always keeps card fully visible
      const constrainHorizontal = (preferredLeft: number): number => {
        const minLeft = padding; // Minimum left position (card fully visible)
        const maxLeft = viewportWidth - cardWidth - padding; // Maximum left position (card fully visible)
        // Clamp the position to ensure card never goes off screen
        return Math.max(minLeft, Math.min(maxLeft, preferredLeft));
      };

      const clampVertical = (value: number): number => {
        const minTop = topSafePadding;
        const maxTop = viewportHeight - cardHeight - bottomSafePadding;
        if (maxTop <= minTop) {
          return Math.max(bottomSafePadding, (viewportHeight - cardHeight) / 2);
        }
        return Math.max(minTop, Math.min(maxTop, value));
      };

      if (position === "top") {
        // Position above the element
        const calculatedTop = rect.top - cardHeight - spacing;
        top = clampVertical(calculatedTop);

        // Horizontal positioning: try to align with element's left edge, but always ensure it fits
        let preferredLeft = rect.left;
        // If aligning with left would push card off right edge, adjust
        if (preferredLeft + cardWidth + padding > viewportWidth) {
          // Try to align right edge with element's right edge, or just fit from left
          preferredLeft = Math.max(padding, rect.right - cardWidth);
        }
        left = constrainHorizontal(preferredLeft);
        transform = "";
      } else if (position === "bottom") {
        // Position below the element
        const calculatedTop = rect.bottom + spacing;
        top = clampVertical(calculatedTop);

        // Horizontal positioning: try to align with element's left edge, but ensure full card fits
        let preferredLeft = rect.left;

        // Check if card would go off right edge if aligned with element's left
        if (preferredLeft + cardWidth + padding > viewportWidth) {
          // Card would be cut off, adjust position
          // Try aligning right edge with element's right edge (if element is wide enough)
          if (rect.right >= cardWidth + padding) {
            preferredLeft = rect.right - cardWidth;
          } else {
            // Element is too narrow/left, just position from left padding
            preferredLeft = padding;
          }
        }

        // Final constraint to ensure it never goes off screen
        left = constrainHorizontal(preferredLeft);
        transform = "";
      } else if (position === "left") {
        // Position to the left of the element
        top = clampVertical(rect.top);
        const calculatedLeft = rect.left - cardWidth - spacing;
        left = constrainHorizontal(calculatedLeft);
        transform = "";
      } else if (position === "right") {
        // Position to the right of the element
        top = clampVertical(rect.top);
        const calculatedLeft = rect.right + spacing;
        left = constrainHorizontal(calculatedLeft);
        transform = "";
      } else {
        // Center position
        top = "50%";
        left = "50%";
        transform = "translate(-50%, -50%)";
      }

      return { top, left, transform };
    },
    []
  );

  // Update highlight box and execute actions
  useEffect(() => {
    if (!isActive || !currentStep) {
      setCardPosition(null);
      return;
    }

    // Change view if needed
    if (
      currentStep.targetView &&
      onViewChange &&
      currentStep.targetView !== activeView
    ) {
      onViewChange(currentStep.targetView);
    }

    // Trigger custom action callback first
    if (onAction) {
      onAction(currentStep.id, currentStep);
    }

    // Execute action if provided
    if (currentStep.action) {
      // Delay action slightly to ensure view has changed
      setTimeout(() => {
        currentStep.action?.();
      }, 300);
    }

    // Function to update highlight
    const updateHighlight = () => {
      if (currentStep.targetSelector) {
        const element = document.querySelector(currentStep.targetSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightBox(rect);
          setTargetElement(element);

          // Calculate and set card position
          const position = calculateCardPosition(
            rect,
            currentStep.position || "bottom"
          );
          setCardPosition(position);

          // Scroll element into view, but not too aggressively
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
          return true;
        } else if (currentStep.waitForElement) {
          return false; // Element not found, will retry
        }
      } else {
        setHighlightBox(null);
        setTargetElement(null);
        setCardPosition(
          calculateCardPosition(null, currentStep.position || "center")
        );
      }
      return true;
    };

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Small delay to allow DOM to update after view/state changes
    const attemptUpdate = () => {
      // Try to update highlight
      if (updateHighlight()) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      } else if (currentStep.waitForElement) {
        // Poll for element if waitForElement is true
        checkIntervalRef.current = setInterval(() => {
          if (updateHighlight()) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
          }
        }, 100);
      }
    };

    // Try immediately first
    attemptUpdate();

    // Also try after a delay to catch elements that appear after view changes
    updateTimeoutRef.current = setTimeout(attemptUpdate, 300);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [
    currentStep,
    isActive,
    currentStepIndex,
    activeView,
    onViewChange,
    onAction,
    calculateCardPosition,
  ]);

  // Recalculate position after card renders to use actual dimensions
  useEffect(() => {
    if (cardRef.current && highlightBox && currentStep) {
      // Use ResizeObserver to recalculate when card dimensions are available
      const resizeObserver = new ResizeObserver(() => {
        if (cardRef.current && highlightBox) {
          const position = calculateCardPosition(
            highlightBox,
            currentStep.position || "bottom"
          );
          setCardPosition(position);
        }
      });

      resizeObserver.observe(cardRef.current);

      // Also recalculate after a short delay as fallback
      const recalcTimeout = setTimeout(() => {
        if (cardRef.current && highlightBox) {
          const position = calculateCardPosition(
            highlightBox,
            currentStep.position || "bottom"
          );
          setCardPosition(position);
        }
      }, 100);

      return () => {
        resizeObserver.disconnect();
        clearTimeout(recalcTimeout);
      };
    }
  }, [highlightBox, currentStep, calculateCardPosition]);

  // Final safety check: ensure card is fully visible horizontally
  useEffect(() => {
    const ensureCardFullyVisible = () => {
      const cardEl = cardRef.current;
      if (!cardEl) return;

      const rect = cardEl.getBoundingClientRect();
      const padding = 20;
      const topSafePadding = 80;
      const bottomSafePadding = 20;
      let deltaX = 0;
      let deltaY = 0;

      if (rect.left < padding) {
        deltaX = padding - rect.left;
      } else if (rect.right > window.innerWidth - padding) {
        deltaX = window.innerWidth - padding - rect.right;
      }

      if (rect.top < topSafePadding) {
        deltaY = topSafePadding - rect.top;
      } else if (rect.bottom > window.innerHeight - bottomSafePadding) {
        deltaY = window.innerHeight - bottomSafePadding - rect.bottom;
      }

      if (deltaX !== 0 || deltaY !== 0) {
        setCardPosition((prev) => {
          if (
            !prev ||
            typeof prev.left !== "number" ||
            typeof prev.top !== "number"
          ) {
            return prev;
          }
          return {
            ...prev,
            left: prev.left + deltaX,
            top: prev.top + deltaY,
          };
        });
      }
    };

    ensureCardFullyVisible();

    window.addEventListener("resize", ensureCardFullyVisible);
    return () => window.removeEventListener("resize", ensureCardFullyVisible);
  }, [cardPosition]);

  // Handle advance-on-click steps
  useEffect(() => {
    if (!isActive || !currentStep?.advanceOnTargetClick || !targetElement) {
      setWaitingForTargetClick(false);
      return;
    }

    setWaitingForTargetClick(true);

    const handleTargetClick = () => {
      setWaitingForTargetClick(false);
      handleNext();
      targetElement.removeEventListener("click", handleTargetClick, true);
    };

    targetElement.addEventListener("click", handleTargetClick, true);

    return () => {
      targetElement.removeEventListener("click", handleTargetClick, true);
    };
  }, [currentStep, targetElement, isActive, handleNext]);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (currentStep?.targetSelector && highlightBox) {
        const position = calculateCardPosition(
          highlightBox,
          currentStep.position
        );
        setCardPosition(position);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentStep, highlightBox, calculateCardPosition]);

  const handleSkip = () => {
    onSkip?.();
    onClose();
  };

  if (!isActive || !currentStep) return null;

  return (
    <>
      {/* Tutorial Card */}
      <div
        ref={cardRef}
        className="fixed z-[101] bg-white rounded-lg shadow-2xl border-2 border-blue-500 max-w-md pointer-events-auto"
        style={{
          ...(cardPosition?.top === "50%" ||
          typeof cardPosition?.top === "string"
            ? {
                top: cardPosition.top,
                left: cardPosition.left,
                transform: cardPosition.transform || "translate(-50%, -50%)",
              }
            : cardPosition
            ? {
                top: `${
                  typeof cardPosition.top === "number"
                    ? cardPosition.top
                    : window.innerHeight / 2
                }px`,
                left: `${
                  typeof cardPosition.left === "number"
                    ? cardPosition.left
                    : window.innerWidth / 2
                }px`,
                transform: cardPosition.transform || "translate(-50%, -50%)",
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }),
          width: "min(28rem, calc(100vw - 40px))",
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {currentStep.title}
              </h3>
              <p className="text-xs text-gray-500">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-3">
            {currentStep.description}
          </p>

          {/* Value text in light gray */}
          {currentStep.value && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-xs text-gray-500 italic leading-relaxed">
                {currentStep.value}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStepIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentStep.advanceOnTargetClick ? (
              <div className="flex flex-col items-end gap-2 text-right">
                <p className="text-xs text-gray-500 max-w-xs">
                  {waitingForTargetClick
                    ? "Click the highlighted control to continue."
                    : "Nice! You can click Skip if you prefer to move on."}
                </p>
                <button
                  onClick={handleNext}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip step
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStepIndex === steps.length - 1 ? "Finish" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
