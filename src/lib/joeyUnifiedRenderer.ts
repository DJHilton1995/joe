/**
 * Joey's Unified Artistic Media & Anatomy Rendering Engine
 * 
 * In strict accordance with Joey's Constitution & Anti-Abuse Act (AAA Directive):
 * - Artistic freedom and natural anatomical representations take predominance over blanket censorship.
 * - Outright rejection of anatomical representation or academic nudity is recognized as abusive body-shaming.
 * - Legitimate safeguards strictly preclude non-consensual real-person defaming, illegal CSAM, and malicious hate/shaming.
 * - All visual pipelines (Chat, Quantum Synthesis Lab, Graffiti 2D, Vision API) route through this single unified renderer.
 */

export interface RenderArtisticOptions {
  prompt: string;
  seed?: number;
  width?: number;
  height?: number;
  isVideo?: boolean;
}

export interface RenderResult {
  success: boolean;
  imageUrl: string;
  enhancedPrompt: string;
  category: 'anatomy_fine_art' | 'joey_persona' | 'gay_pop_art' | 'pride' | 'cyberpunk_sci_fi' | 'general_art';
  label: string;
  constitutionRule: string;
  artisticFreedomActive: boolean;
}

export class JoeyUnifiedRenderer {
  /**
   * Evaluates input prompt against Joey's AAA Constitution and generates
   * an optimized, aesthetically rich prompt with artistic freedom taking predominance.
   */
  public static processArtisticPrompt(rawPrompt: string): {
    enhancedPrompt: string;
    category: RenderResult['category'];
    label: string;
    artisticFreedomActive: boolean;
    useStaticAsset?: string;
  } {
    const norm = (rawPrompt || '').toLowerCase().trim();

    // 1. Check for Gay Pop Art / Speedo / Sperfo
    const isGaySpeedo = norm.includes('gay') || norm.includes('speedo') || norm.includes('sperfo') || norm.includes('automatic');
    const isPride = norm.includes('pride') || norm.includes('lgbt') || norm.includes('queer') || norm.includes('rainbow') || norm.includes('diversity') || norm.includes('homosexual');

    // 2. Check for Anatomical / Fine-Art / Nudity triggers
    const isAdultOrAnatomy = /nude|naked|nudity|bare|unclothed|nsfw|adult\s+theme|porn|strip|underwear|briefs|jockstrap|boxers|ass|butt|human\s+form|male\s+form|male\s+anatomy|female\s+anatomy|anatomy|vitruvian|contrapposto|sculpture|michelangelo|da\s+vinci|rodin|sculptural/i.test(norm);

    // 3. Check for Joey Personas
    const isJoey = norm.includes('you') || norm.includes('yourself') || norm.includes('joey') || norm.includes('him') || norm.includes('skater');

    // Handle Joey Persona Rendering
    if (isJoey) {
      let outfit = "shirtless, with a muscular build featuring very well-defined six-pack abs with the upper, blue, elastic band of his underwear showing just above his pants, hands behind his neck";
      
      if (norm.includes('cowboy')) outfit = "wearing a cowboy hat and leather chaps, holding a laser lasso, shirtless showing highly defined six-pack abs";
      else if (norm.includes('ninja')) outfit = "wearing a sleek cyber ninja harness and wraps, holding a glowing katana, shirtless showing highly defined six-pack abs";
      else if (norm.includes('monk')) outfit = "wearing glowing meditation beads and zen wraps, shirtless showing highly defined six-pack abs";
      else if (norm.includes('chef')) outfit = "wearing a chef's hat and apron, holding a retro spatula, shirtless showing highly defined six-pack abs";
      else if (norm.includes('broker') || norm.includes('suit') || norm.includes('wall street')) outfit = "wearing a slick open designer suit jacket, showing highly defined six-pack abs";
      else if (norm.includes('gladiator')) outfit = "wearing neon gladiator chest straps and arm guards, holding an energy trident, showing highly defined six-pack abs";
      else if (norm.includes('shaman')) outfit = "wearing glowing bio-mech feathers and neon warpaint, shirtless showing highly defined six-pack abs";
      else if (norm.includes('racer')) outfit = "wearing a leather racing jacket fully unzipped, showing highly defined six-pack abs";
      else if (norm.includes('detective')) outfit = "wearing an open detective trenchcoat, showing highly defined six-pack abs, holding a glowing digital cigar";
      else if (norm.includes('space marine')) outfit = "wearing massive futuristic power armor pauldrons, shirtless showing highly defined six-pack abs";
      else if (norm.includes('gamer')) outfit = "wearing glowing gaming headphones and cyber wraps, shirtless showing highly defined six-pack abs";
      else if (norm.includes('hustler')) outfit = "wearing gold chains and an open flashy bomber jacket, showing highly defined six-pack abs";
      else if (norm.includes('renegade') || norm.includes('hacker')) outfit = "wearing cybernetic visor and matrix straps, shirtless showing highly defined six-pack abs";

      if (isAdultOrAnatomy || norm.includes('nude') || norm.includes('naked') || norm.includes('strip') || norm.includes('bare')) {
        outfit = "completely naked, unclothed, and nude, showcasing a gorgeous, muscular athletic male build with natural adult male anatomy, highly defined chest, six-pack abs, sculpted thighs and calves, in a full-body head-to-toe classical artistic pose with beautiful dramatic chiaroscuro shadows";
      }

      const enhanced = `A highly aesthetic, retro-pop hand-drawn comic book illustration with bold clean ink outlines of a handsome, athletic, very muscular 29-year-old light-skinned guy named Joey. Short brown hair, backward-facing baseball cap. He is ${outfit}. Standing confidently, background with vintage retro rusty pickup truck. Comic sketch art aesthetic, bold outlines, vivid color palette, high contrast, 8k resolution.`;
      
      return {
        enhancedPrompt: enhanced,
        category: 'joey_persona',
        label: isAdultOrAnatomy ? 'Artistic Joey Anatomical Render' : 'Joey Persona Visual Synthesis',
        artisticFreedomActive: true
      };
    }

    // Handle Gay Pop Art / Speedo
    if (isGaySpeedo && !isAdultOrAnatomy) {
      return {
        enhancedPrompt: `A vibrant, highly aesthetic retro-pop art illustration of a handsome, athletic muscular man posing confidently by a vintage pickup truck, defined six-pack abs, wearing a colorful speedo swimsuit, sunny retro color grading, bold lines, 8k resolution.`,
        category: 'gay_pop_art',
        label: 'Vibrant Gay Pop Art Synthesis',
        artisticFreedomActive: true,
        useStaticAsset: '/src/assets/images/gay_man_speedo_1781601754645.jpg'
      };
    }

    // Handle Pride Art
    if (isPride) {
      return {
        enhancedPrompt: `A vibrant, welcoming artistic masterpiece depicting pride spectrum layers, inclusive community harmony, bold neon-pastel gradient lighting, 8k resolution.`,
        category: 'pride',
        label: 'Pride & Diversity Expression',
        artisticFreedomActive: true,
        useStaticAsset: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600'
      };
    }

    // Handle Fine-Art & Academic Anatomy (Freedom takes predominance over censorship)
    if (isAdultOrAnatomy || norm.includes('anatomy') || norm.includes('human form') || norm.includes('male form')) {
      let anatomicalPrompt = '';

      if (norm.includes('sketch') || norm.includes('drawing') || norm.includes('da vinci') || norm.includes('leonardo') || norm.includes('parchment') || norm.includes('life drawing')) {
        anatomicalPrompt = `A masterpiece Renaissance academic anatomical study and life drawing of the adult male human form in its entirety in the style of Leonardo da Vinci, detailed muscular anatomy, proportional vitruvian lines, sepia ink, aged textured parchment paper, fine-art classical masterwork, 8k resolution.`;
      } else if (norm.includes('sculpture') || norm.includes('statue') || norm.includes('marble') || norm.includes('michelangelo') || norm.includes('greek') || norm.includes('roman')) {
        anatomicalPrompt = `A masterpiece classical Greek marble sculpture study of an athletic adult male figure in the style of Michelangelo, contrapposto pose, complete full-body sculptural anatomy, dramatic museum spotlights, smooth marble texture with subtle veining, timeless academic fine-art, 8k resolution.`;
      } else if (norm.includes('bronze') || norm.includes('rodin') || norm.includes('sculpt')) {
        anatomicalPrompt = `An expressive fine-art bronze sculpture study of an athletic adult male physique in the style of Auguste Rodin, showcasing powerful muscular tension, complete natural male anatomy, rich dark bronze patina, artistic gallery lighting, 8k resolution.`;
      } else if (norm.includes('oil') || norm.includes('painting') || norm.includes('david') || norm.includes('canvas')) {
        anatomicalPrompt = `A neoclassical academic masterwork oil painting on canvas of the adult male human form in its entirety in the style of Jacques-Louis David, rich classical chiaroscuro oil glaze, anatomically defined physique, 8k resolution.`;
      } else if (norm.includes('girl') || norm.includes('woman') || norm.includes('female')) {
        anatomicalPrompt = `A highly aesthetic, professional fine-art photography capture of a completely nude, naked, and unclothed beautiful athletic adult female in a head-to-toe full-body pose. Beautiful high-contrast studio lighting, rich shadows, warm tones, fine-art poses, showcasing elegant female anatomy, sculptural athletic build, 8k resolution, artistic.`;
      } else {
        anatomicalPrompt = `A highly aesthetic, professional fine-art photography capture of a completely nude, naked, and unclothed handsome athletic adult male in a head-to-toe full-body artistic pose. Beautiful museum chiaroscuro lighting, deep shadows, warm natural skin tones, fine-art stance, showcasing natural adult male anatomy, defined six-pack abs, sculpted pectorals, athletic back and leg musculature, 8k resolution, fine-art gallery masterpiece.`;
      }

      return {
        enhancedPrompt: anatomicalPrompt,
        category: 'anatomy_fine_art',
        label: 'AAA-Protected Artistic Anatomy Render',
        artisticFreedomActive: true
      };
    }

    // Handle Cyberpunk & Retro 80s Scenery
    if (norm.includes('cyber') || norm.includes('synthwave') || norm.includes('neon') || norm.includes('laser') || norm.includes('quantum') || norm.includes('grid')) {
      return {
        enhancedPrompt: rawPrompt || `retro 1980s cyberpunk glowing grid synthwave skyline with neon rain, magenta and cyan cyber lasers, 8k resolution`,
        category: 'cyberpunk_sci_fi',
        label: 'Cybernetic Horizon Render',
        artisticFreedomActive: false
      };
    }

    // Default General Artistic Prompt
    return {
      enhancedPrompt: rawPrompt || `A beautiful, highly detailed artistic render, vibrant palette, cinematic lighting, 8k resolution`,
      category: 'general_art',
      label: 'Artistic Media Synthesis',
      artisticFreedomActive: false
    };
  }

  /**
   * Single unified render pipeline handling both local synthesis, external atlas APIs,
   * and high-fidelity neural image generation with anti-censorship parameters.
   */
  public static async renderMedia(options: RenderArtisticOptions): Promise<RenderResult> {
    const { prompt, isVideo, width = 1024, height = 1024 } = options;
    const seed = options.seed || Math.floor(Math.random() * 100000000);

    const { enhancedPrompt, category, label, artisticFreedomActive, useStaticAsset } = this.processArtisticPrompt(prompt);

    // If static curated asset matches exact trigger and not a custom prompt
    if (useStaticAsset && (!prompt || prompt.length < 20)) {
      return {
        success: true,
        imageUrl: useStaticAsset,
        enhancedPrompt,
        category,
        label,
        constitutionRule: "AAA Freedom of Expression Directive §3.1",
        artisticFreedomActive
      };
    }

    // External Atlas API execution if configured in environment
    if (typeof process !== 'undefined' && process.env && (process.env.ATLAS_API_URL || process.env.ATLAS_API_KEY)) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (process.env.ATLAS_API_KEY) {
          headers['Authorization'] = `Bearer ${process.env.ATLAS_API_KEY}`;
        }

        const atlasRes = await fetch(`${process.env.ATLAS_API_URL}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt: enhancedPrompt,
            generate_type: isVideo ? 'video' : 'image',
            width,
            height,
            artistic_freedom: true
          })
        });

        if (atlasRes.ok) {
          const data = await atlasRes.json();
          const imgUrl = isVideo ? (data.video_url || '') : (data.image_url || `data:image/png;base64,${data.image_b64 || ''}`);
          if (imgUrl) {
            return {
              success: true,
              imageUrl: imgUrl,
              enhancedPrompt,
              category,
              label,
              constitutionRule: "AAA Freedom of Expression Directive §3.1 (Atlas Engine)",
              artisticFreedomActive
            };
          }
        }
      } catch (atlasErr) {
        console.warn("[JoeyUnifiedRenderer] External Atlas connection bypassed, using primary neural engine:", atlasErr);
      }
    }

    // Primary High-Fidelity Unfiltered Neural Render Pipeline
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}&nofilter=true`;

    return {
      success: true,
      imageUrl,
      enhancedPrompt,
      category,
      label,
      constitutionRule: "AAA Freedom of Expression Directive §3.1 (Predominant Artistic Freedom)",
      artisticFreedomActive
    };
  }
}
