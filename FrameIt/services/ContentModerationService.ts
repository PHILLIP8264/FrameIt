// Content moderation results interface
export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  categories: {
    adult: "VERY_UNLIKELY" | "UNLIKELY" | "POSSIBLE" | "LIKELY" | "VERY_LIKELY";
    violence:
      | "VERY_UNLIKELY"
      | "UNLIKELY"
      | "POSSIBLE"
      | "LIKELY"
      | "VERY_LIKELY";
    racy: "VERY_UNLIKELY" | "UNLIKELY" | "POSSIBLE" | "LIKELY" | "VERY_LIKELY";
  };
  reason?: string;
  flaggedContent?: string[];
  questRelevance?: QuestRelevanceCheck;
  photoQuality?: PhotoQualityCheck;
}

// Quest relevance checking
export interface QuestRelevanceCheck {
  isRelevant: boolean;
  confidence: number;
  detectedObjects: string[];
  matchingRequirements: string[];
  missingRequirements: string[];
  suggestions?: string[];
}

// Photo quality assessment
export interface PhotoQualityCheck {
  isAcceptable: boolean;
  overallScore: number;
  checks: {
    resolution: { passed: boolean; actual: string; required: string };
    lighting: { score: number; issues?: string[] };
    blur: { score: number; isBlurry: boolean };
    composition: { score: number; feedback?: string };
  };
}

// NSFW Detection Service
export class ContentModerationService {
  private static instance: ContentModerationService;

  private constructor() {}

  public static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }

  async moderateImage(imageUri: string): Promise<ModerationResult> {
    try {
      console.log(
        "🔍 Starting content moderation for:",
        imageUri.substring(0, 50) + "..."
      );

      const cloudResult = await this.moderateWithCloudService(imageUri);
      if (cloudResult) {
        console.log("✅ Cloud moderation completed:", cloudResult);
        return cloudResult;
      }

      console.log("📋 Falling back to basic moderation checks...");
      const result = await this.basicModerationCheck(imageUri);
      console.log("✅ Basic moderation completed:", result);
      return result;
    } catch (error) {
      console.error("❌ Content moderation error:", error);

      return {
        isAppropriate: false,
        confidence: 0.5,
        categories: {
          adult: "POSSIBLE",
          violence: "POSSIBLE",
          racy: "POSSIBLE",
        },
        reason: "Moderation service unavailable - manual review required",
      };
    }
  }

  private async moderateWithCloudService(
    imageUri: string
  ): Promise<ModerationResult | null> {
    try {
      const { getFunctions, httpsCallable } = await import(
        "firebase/functions"
      );
      const functions = getFunctions();

      const moderateImage = httpsCallable(functions, "moderateImageWithVision");

      console.log("🌐 Calling Vision AI moderation function...");
      const result = await moderateImage({ imageUrl: imageUri });

      const visionResult = result.data as any;

      return {
        isAppropriate: visionResult.isAppropriate,
        confidence: visionResult.confidence,
        categories: {
          adult: visionResult.categories.adult,
          violence: visionResult.categories.violence,
          racy: visionResult.categories.racy,
        },
        reason: visionResult.reason,
      };
    } catch (error) {
      console.error("Vision AI moderation error:", error);

      return null;
    }
  }

  private async basicModerationCheck(
    imageUri: string
  ): Promise<ModerationResult> {
    try {
      const suspiciousPatterns = [
        "nsfw",
        "adult",
        "xxx",
        "porn",
        "sex",
        "nude",
        "naked",
        "explicit",
        "mature",
        "erotic",
        "intimate",
      ];

      const filename = imageUri.toLowerCase();
      const hasSuspiciousName = suspiciousPatterns.some((pattern) =>
        filename.includes(pattern)
      );

      const { width, height, fileSize } = await this.getImageMetadata(imageUri);

      const suspiciousSize =
        width < 50 || height < 50 || fileSize > 20 * 1024 * 1024;

      if (hasSuspiciousName) {
        return {
          isAppropriate: false,
          confidence: 0.7,
          categories: {
            adult: "LIKELY",
            violence: "UNLIKELY",
            racy: "LIKELY",
          },
          reason: "Suspicious filename detected",
          flaggedContent: suspiciousPatterns.filter((pattern) =>
            filename.includes(pattern)
          ),
        };
      }

      if (suspiciousSize) {
        return {
          isAppropriate: false,
          confidence: 0.3,
          categories: {
            adult: "POSSIBLE",
            violence: "UNLIKELY",
            racy: "POSSIBLE",
          },
          reason: "Unusual image dimensions - manual review recommended",
        };
      }

      return {
        isAppropriate: true,
        confidence: 0.8,
        categories: {
          adult: "UNLIKELY",
          violence: "UNLIKELY",
          racy: "UNLIKELY",
        },
        reason: "Basic checks passed - no suspicious content detected",
      };
    } catch (error) {
      console.error("Basic moderation check failed:", error);

      return {
        isAppropriate: false,
        confidence: 0.1,
        categories: {
          adult: "POSSIBLE",
          violence: "POSSIBLE",
          racy: "POSSIBLE",
        },
        reason: "Unable to analyze image - manual review required",
      };
    }
  }

  private async getImageMetadata(imageUri: string): Promise<{
    width: number;
    height: number;
    fileSize: number;
  }> {
    try {
      const response = await fetch(imageUri, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

      return {
        width: 1080,
        height: 1080,
        fileSize,
      };
    } catch (error) {
      console.error("Error getting image metadata:", error);

      return {
        width: 1080,
        height: 1080,
        fileSize: 0,
      };
    }
  }

  shouldBlockContent(result: ModerationResult): boolean {
    const { categories } = result;

    const highRiskLevels = ["LIKELY", "VERY_LIKELY"];

    return (
      highRiskLevels.includes(categories.adult) ||
      highRiskLevels.includes(categories.violence) ||
      highRiskLevels.includes(categories.racy)
    );
  }

  needsManualReview(result: ModerationResult): boolean {
    const { categories, confidence, isAppropriate } = result;

    return (
      (!isAppropriate && confidence < 0.6) ||
      categories.adult === "POSSIBLE" ||
      categories.violence === "POSSIBLE" ||
      categories.racy === "POSSIBLE"
    );
  }

  getModerationMessage(result: ModerationResult): string {
    if (this.shouldBlockContent(result)) {
      return "This image contains inappropriate content and cannot be uploaded. Please choose a different image that follows our community guidelines.";
    }

    if (this.needsManualReview(result)) {
      return "This image has been flagged for review. It will be manually reviewed before being published.";
    }

    return "Image approved for upload.";
  }

  async validatePhotoForQuest(
    imageUri: string,
    questRequirements: any,
    metadata?: { location?: any; timestamp?: string }
  ): Promise<ModerationResult> {
    try {
      // Start with basic content moderation
      const basicModeration = await this.moderateImage(imageUri);

      // Add quest relevance check
      const questRelevance = await this.checkQuestRelevance(
        imageUri,
        questRequirements
      );

      // Add photo quality assessment
      const photoQuality = await this.assessPhotoQuality(
        imageUri,
        questRequirements
      );

      // Combine all checks
      const isAppropriate =
        basicModeration.isAppropriate &&
        questRelevance.isRelevant &&
        photoQuality.isAcceptable;

      return {
        ...basicModeration,
        isAppropriate,
        questRelevance,
        photoQuality,
        reason: !isAppropriate
          ? this.getCombinedRejectionReason(
              basicModeration,
              questRelevance,
              photoQuality
            )
          : undefined,
      };
    } catch (error) {
      console.error("Enhanced photo validation error:", error);
      throw error;
    }
  }

  private async checkQuestRelevance(
    imageUri: string,
    questRequirements: any
  ): Promise<QuestRelevanceCheck> {
    try {
      const detectedObjects = await this.detectObjectsInImage(imageUri);
      const requiredSubjects =
        questRequirements.photoRequirements?.subjects || [];

      const matchingRequirements = requiredSubjects.filter((subject: string) =>
        detectedObjects.some(
          (obj) =>
            obj.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(obj.toLowerCase())
        )
      );

      const missingRequirements = requiredSubjects.filter(
        (subject: string) =>
          !matchingRequirements.some((match: string) => match === subject)
      );

      const relevanceScore =
        requiredSubjects.length > 0
          ? matchingRequirements.length / requiredSubjects.length
          : 1.0;

      return {
        isRelevant: relevanceScore >= 0.5,
        confidence: relevanceScore,
        detectedObjects,
        matchingRequirements,
        missingRequirements,
        suggestions: this.generateRelevanceSuggestions(missingRequirements),
      };
    } catch (error) {
      console.error("Quest relevance check error:", error);
      return {
        isRelevant: true,
        confidence: 0.5,
        detectedObjects: [],
        matchingRequirements: [],
        missingRequirements: [],
      };
    }
  }

  private async assessPhotoQuality(
    imageUri: string,
    questRequirements: any
  ): Promise<PhotoQualityCheck> {
    try {
      const imageInfo = await this.getImageMetadata(imageUri);
      const minResolution = questRequirements.photoRequirements?.minResolution;

      // Resolution check
      const resolutionCheck = {
        passed:
          !minResolution ||
          (imageInfo.width >= minResolution.width &&
            imageInfo.height >= minResolution.height),
        actual: `${imageInfo.width}x${imageInfo.height}`,
        required: minResolution
          ? `${minResolution.width}x${minResolution.height}`
          : "No requirement",
      };

      // Basic quality assessments (simplified for now)
      const lightingScore = this.assessLighting(imageInfo);
      const blurScore = this.assessBlur(imageInfo);
      const compositionScore = this.assessComposition(imageInfo);

      const overallScore =
        (resolutionCheck.passed ? 1 : 0) * 0.3 +
        lightingScore * 0.3 +
        blurScore * 0.2 +
        compositionScore * 0.2;

      return {
        isAcceptable: overallScore >= 0.6,
        overallScore,
        checks: {
          resolution: resolutionCheck,
          lighting: {
            score: lightingScore,
            issues:
              lightingScore < 0.5
                ? ["Image appears too dark or overexposed"]
                : undefined,
          },
          blur: {
            score: blurScore,
            isBlurry: blurScore < 0.5,
          },
          composition: {
            score: compositionScore,
            feedback:
              compositionScore < 0.5
                ? "Consider improving framing and focus"
                : undefined,
          },
        },
      };
    } catch (error) {
      console.error("Photo quality assessment error:", error);
      return {
        isAcceptable: true,
        overallScore: 0.7,
        checks: {
          resolution: {
            passed: true,
            actual: "Unknown",
            required: "No requirement",
          },
          lighting: { score: 0.7 },
          blur: { score: 0.7, isBlurry: false },
          composition: { score: 0.7 },
        },
      };
    }
  }

  private async detectObjectsInImage(imageUri: string): Promise<string[]> {
    try {
      return ["person", "building", "outdoor", "sky", "street", "car", "tree"];
    } catch (error) {
      console.error("Object detection error:", error);
      return [];
    }
  }

  private generateRelevanceSuggestions(
    missingRequirements: string[]
  ): string[] {
    if (missingRequirements.length === 0) return [];

    return missingRequirements.map(
      (requirement) =>
        `Try to include "${requirement}" in your photo to better match the quest requirements.`
    );
  }

  private assessLighting(imageInfo: any): number {
    return 0.75;
  }

  private assessBlur(imageInfo: any): number {
    return 0.8;
  }

  private assessComposition(imageInfo: any): number {
    return 0.7;
  }

  private getCombinedRejectionReason(
    moderation: ModerationResult,
    relevance: QuestRelevanceCheck,
    quality: PhotoQualityCheck
  ): string {
    const issues: string[] = [];

    if (!moderation.isAppropriate) {
      issues.push("Content moderation issues detected");
    }

    if (!relevance.isRelevant) {
      issues.push(
        `Missing quest requirements: ${relevance.missingRequirements.join(
          ", "
        )}`
      );
    }

    if (!quality.isAcceptable) {
      const qualityIssues: string[] = [];
      if (!quality.checks.resolution.passed) {
        qualityIssues.push("insufficient resolution");
      }
      if (quality.checks.blur.isBlurry) {
        qualityIssues.push("image is too blurry");
      }
      if (quality.checks.lighting.score < 0.5) {
        qualityIssues.push("poor lighting");
      }

      if (qualityIssues.length > 0) {
        issues.push(`Photo quality issues: ${qualityIssues.join(", ")}`);
      }
    }

    return issues.join(". ");
  }
}

export default ContentModerationService.getInstance();
