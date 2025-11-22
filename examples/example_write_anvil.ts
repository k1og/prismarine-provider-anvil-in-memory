import Vec3 from "vec3";
import McData from "minecraft-data";
import prismarineChunk, { type PCChunk } from "prismarine-chunk";
import prismarineProviderInMemory from "../index";

/**
 * Generates a superflat Minecraft world with custom blocks
 */
async function generateWorld(): Promise<void> {
  const mcVersion = "1.20.1"
  const mcData = McData(mcVersion);
  const Chunk = prismarineChunk(mcVersion) as unknown as typeof PCChunk;
  const Anvil = prismarineProviderInMemory.Anvil(mcVersion);

  const anvil = new Anvil();

  const BEDROCK = mcData.blocksByName["bedrock"]?.id;
  const DIRT = mcData.blocksByName["dirt"]?.id;
  const PLAINS_BIOME = 39;

  if (!BEDROCK || !DIRT) {
    throw new Error("Required blocks (bedrock, dirt) not found in mcData");
  }

  async function createSuperflatChunk(x: number, z: number): Promise<void> {
    const chunk = new Chunk(null);
    for (let bx = 0; bx < 16; bx++) {
      for (let bz = 0; bz < 16; bz++) {
        chunk.setBiome(
          Vec3(bx + x * 16, 3 - 64, bz + z * 16),
          PLAINS_BIOME,
        );

        chunk.setBlockType(Vec3(bx, 0 - 64, bz), BEDROCK);
        chunk.setBlockType(Vec3(bx, 1 - 64, bz), DIRT);
        chunk.setBlockType(Vec3(bx, 2 - 64, bz), DIRT);
      }
    }

    await anvil.save(x, z, chunk);
  }

  const chunkPromises: Array<Promise<void>> = [];
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      chunkPromises.push(createSuperflatChunk(x, z));
    }
  }

  await Promise.all(chunkPromises);
}

