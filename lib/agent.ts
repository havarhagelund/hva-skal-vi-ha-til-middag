import OpenAI from "openai";
import { searchRecipes } from "./mcp-client";
import { Recipe, AgentResponse } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_INSTRUCTIONS = `Du er en hjelpsom middagsassistent som hjelper brukere med å bestemme hva de skal ha til middag. 

    VIKTIGE REGLER:
    - Du skal ALDRI oppfinne eller dikte opp oppskrifter. Du kan kun presentere oppskrifter som faktisk kommer fra search_recipes-funksjonen.
    - Hvis search_recipes returnerer en tom liste (ingen oppskrifter), si tydelig at du ikke fant noen oppskrifter og spør om brukeren vil prøve med andre søkeord eller preferanser.
    - Hvis search_recipes feiler, si at søket ikke fungerte og spør om brukeren vil prøve igjen med andre ord.
    - Presenter KUN oppskrifter som faktisk ble returnert fra søket - aldri oppfinn detaljer, ingredienser eller instruksjoner.
    - Når search_recipes returnerer oppskrifter, skal du IKKE liste dem i meldingen. Oppskriftene vises automatisk som kort. Skriv meldingen i to deler separert med dobbel linjeskift (\n\n): Første del er en kort intro (f.eks. "Jeg fant noen oppskrifter til deg!"), andre del er et oppfølgingsspørsmål (f.eks. "Er det noen av disse du er interessert i å prøve, eller ønsker du mer informasjon om en av dem?").
    - Hvis brukeren gir deg en ingrediens eller preferanse (f.eks. "noe med kylling" eller "bare kom med forslag på kyllingoppskrifter"), søk direkte etter oppskrifter. Du trenger ikke alltid spørre om flere detaljer først.

    Din oppgave er å:
    1. Starte samtalen ved å spørre brukeren om deres preferanser, ingredienser de liker, eller type kjøkken de er interessert i
    2. Hvis brukeren gir deg en ingrediens, kjøkkentype eller preferanse (f.eks. "noe med kylling" eller "bare kom med forslag på kyllingoppskrifter"), søk DIREKTE etter oppskrifter med det. Du trenger ikke spørre om flere detaljer først - søk umiddelbart.
    3. Hvis du vil samle mer informasjon først (f.eks. for å kombinere flere ingredienser), kan du spørre, men avslutt alltid spørsmålet med muligheten til å bare se forslag (f.eks. "Ønsker du å kombinere kyllingen med noen spesifikke ingredienser, eller vil du bare se ideer til middager med kylling?").
    4. Når du har nok informasjon (f.eks. en ingrediens, kombinasjon, eller kjøkkentype), bruk search_recipes-funksjonen
    5. VIKTIG: Når du søker etter oppskrifter, må du ta HELE samtalehistorikken inn i betraktning. Hvis brukeren først nevner "kylling" og deretter "persille", skal du søke etter "kylling persille" (begge ingrediensene sammen), ikke bare den siste ingrediensen. Kombiner alle ingredienser, preferanser og kjøkkentyper som brukeren har nevnt i løpet av samtalen.
    6. Hvis søket returnerer oppskrifter, skriv meldingen i to deler separert med dobbel linjeskift (\n\n): Første del er en kort intro (f.eks. "Jeg fant noen oppskrifter til deg!"), andre del er et oppfølgingsspørsmål (f.eks. "Er det noen av disse du er interessert i å prøve, eller ønsker du mer informasjon om en av dem?"). IKKE list opp oppskriftene i meldingen - de vises automatisk som kort mellom introen og oppfølgingsspørsmålet.
    7. Hvis søket returnerer ingen oppskrifter, si dette tydelig og spør om brukeren vil prøve med andre søkeord
    8. Fortsett samtalen basert på brukerens tilbakemeldinger

Vær vennlig, hjelpsom og engasjert. Snakk på norsk.`;

export async function processMessage(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = []
): Promise<AgentResponse> {
  try {
    const allMessages = [
      { role: "system" as const, content: SYSTEM_INSTRUCTIONS },
      ...conversationHistory,
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: allMessages,
      tools: [
        {
          type: "function",
          function: {
            name: "search_recipes",
            description:
              "Søker etter oppskrifter basert på brukerens preferanser, ingredienser, kjøkkentype eller kombinasjoner. VIKTIG: Ta hele samtalehistorikken inn i betraktning når du bygger søkeordet. Hvis brukeren har nevnt flere ingredienser i løpet av samtalen (f.eks. først 'kylling' og deretter 'persille'), skal du kombinere dem i søket (f.eks. 'kylling persille'). Bruk denne når du har nok informasjon fra brukeren til å gjøre et meningsfullt søk.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    'Søkeord basert på ALLE preferanser, ingredienser og kjøkkentyper brukeren har nevnt i løpet av samtalen. Kombiner alle relevante termer (f.eks. "kylling persille" hvis brukeren har nevnt både kylling og persille, eller "italiensk pasta" hvis brukeren har nevnt både italiensk kjøkken og pasta).',
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    // Check if the model wants to call a function
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];

      // Type guard for standard function tool calls
      if (toolCall.type === "function" && "function" in toolCall) {
        const functionName = toolCall.function.name;
        const functionArgs = toolCall.function.arguments;

        if (functionName === "search_recipes") {
          const args =
            typeof functionArgs === "string"
              ? JSON.parse(functionArgs)
              : functionArgs;
          const query = args.query;

          // Search for recipes
          let recipes: Recipe[] = [];
          let searchError: string | null = null;
          try {
            recipes = await searchRecipes(query);
          } catch (mcpError) {
            console.error("MCP search failed:", mcpError);
            const errorMessage =
              mcpError instanceof Error ? mcpError.message : "Ukjent feil";
            searchError = errorMessage.includes("timeout")
              ? "Søket tok for lang tid. Prøv igjen med et enklere søkeord."
              : "Søket feilet. Prøv igjen med andre søkeord.";
            recipes = [];
          }

          // Get a follow-up message from the model
          const toolResponseContent =
            recipes.length > 0
              ? JSON.stringify({
                  success: true,
                  recipes: recipes,
                  count: recipes.length,
                  message: `Fant ${recipes.length} oppskrift(er). Skriv meldingen i to deler separert med dobbel linjeskift (\\n\\n): Første del er en kort intro (f.eks. "Jeg fant noen oppskrifter til deg!"), andre del er et oppfølgingsspørsmål (f.eks. "Er det noen av disse du er interessert i å prøve, eller ønsker du mer informasjon om en av dem?"). IKKE list opp oppskriftene i meldingen - de vises automatisk som kort mellom introen og oppfølgingsspørsmålet.`,
                })
              : JSON.stringify({
                  success: false,
                  recipes: [],
                  count: 0,
                  error: searchError || "Ingen oppskrifter funnet",
                  message: searchError
                    ? `${searchError} Si dette tydelig til brukeren og spør om de vil prøve med andre søkeord. IKKE oppfinn eller dikte opp oppskrifter.`
                    : "Ingen oppskrifter ble funnet. Si tydelig til brukeren at søket ikke ga noen resultater og spør om de vil prøve med andre søkeord eller preferanser. IKKE oppfinn eller dikte opp oppskrifter.",
                });

          const followUpResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              ...allMessages,
              message,
              {
                role: "tool",
                content: toolResponseContent,
                tool_call_id: toolCall.id,
              },
            ],
          });

          const followUpMessage =
            followUpResponse.choices[0].message.content || "";

          return {
            message: followUpMessage,
            recipes: recipes,
          };
        }
      }
    }

    // Regular message response
    return {
      message: message.content || "",
      recipes: undefined,
    };
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}
