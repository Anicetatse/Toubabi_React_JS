import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      selected_quartier_id,
      superficie,
      standing,
      ouvrage,
      niveau,
      logement_type,
      couverture_section,
      pieces,
    } = body;

    // Récupérer les données d'estimation pour le quartier
    const estimation = await prisma.$queryRawUnsafe(`
      SELECT 
        coefficient_occupa_sols,
        hauteur,
        niveau,
        prix_gros_oeuvre_r0_dalle,
        prix_gros_oeuvre_r1_r3,
        prix_gros_oeuvre_r4_r6,
        prix_gros_oeuvre_r7_r9,
        prix_gros_oeuvre_r10_rx,
        prix_second_oeuvre_bas,
        prix_second_oeuvre_moyen,
        prix_second_oeuvre_haut,
        prix_second_oeuvre_tres_haut
      FROM estimes 
      WHERE id_quartier = ?
      LIMIT 1
    `, selected_quartier_id);

    if (!estimation || (estimation as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune donnée d\'estimation trouvée pour ce quartier' },
        { status: 404 }
      );
    }

    const estimData = (estimation as any[])[0];
    const coefficientOccupationSols = parseFloat(estimData.coefficient_occupa_sols);
    const superficieRestante = superficie * coefficientOccupationSols / 100;

    let result: any = {
      standing,
      ouvrage,
      superficie,
      superficieRestante,
    };

    // ========================================
    // CALCUL POUR IMMEUBLE
    // ========================================
    if (ouvrage === 'immeuble') {
      // Extraire le numéro de niveau (R+1 => 2, R+2 => 3, etc.)
      const numeroNiveau = parseInt(niveau.replace(/\D/g, '')) + 1 || 1;
      
      // 1. Calcul du coût du gros œuvre par m² selon le niveau
      let prixGrosOeuvreParM2 = 100000; // Par défaut pour R+0
      
      if (numeroNiveau >= 1 && numeroNiveau <= 11) {
        switch (numeroNiveau) {
          case 1:
            prixGrosOeuvreParM2 = 100000;
            break;
          case 2:
          case 3:
          case 4:
            prixGrosOeuvreParM2 = 110000;
            break;
          case 5:
          case 6:
          case 7:
            prixGrosOeuvreParM2 = 130000;
            break;
          case 8:
          case 9:
          case 10:
            prixGrosOeuvreParM2 = 150000;
            break;
          case 11:
            prixGrosOeuvreParM2 = 180000;
            break;
          default:
            prixGrosOeuvreParM2 = 100000;
            break;
        }
      }

      // Calcul total gros œuvre = prix/m² × surface constructible × nombre de niveaux
      const coutGrosOeuvre = prixGrosOeuvreParM2 * superficieRestante * numeroNiveau;
      
      // 2. Calcul du coût du second œuvre selon le standing
      let prixSecondOeuvreParM2 = 0;
      
      if (standing === 'economique') {
        prixSecondOeuvreParM2 = 120000;
      } else if (standing === 'moyen') {
        prixSecondOeuvreParM2 = 300000; // Formule exacte de Laravel
      } else if (standing === 'haut') {
        prixSecondOeuvreParM2 = 500000; // Formule exacte de Laravel
      } else if (standing === 'tres_haut') {
        prixSecondOeuvreParM2 = 1000000; // Formule exacte de Laravel
      }

      const coutSecondOeuvre = prixSecondOeuvreParM2 * numeroNiveau * superficieRestante;
      
      // 3. Coût total
      const coutGlobal = coutGrosOeuvre + coutSecondOeuvre;

      result = {
        ...result,
        niveau,
        coutGrosOeuvre,
        coutSecondOeuvre,
        coutGlobal,
      };
    }
    // ========================================
    // CALCUL POUR LOGEMENT
    // ========================================
    else if (ouvrage === 'logement') {
      let cout_couverture_legere = 0;
      let cout_couverture_dalle = 0;
      let cout_global_couverture_legere = 0;
      let cout_global_couverture_dalle = 0;
      let cout_second_oeuvre = 0;
      let surface_construite_logement = 0;
      let surface_construite_logement1 = 0;

      // Variables pour standing HAUT et TRÈS HAUT
      let cout_couverture = 0;
      let cout_second_oeuvre2 = 0;
      let cout_global = 0;

      // ========================================
      // STANDING ÉCONOMIQUE
      // ========================================
      if (standing === 'economique') {
        // Calculer les valeurs de base (plain_pied), puis multiplier pour duplex/triplex
        // COUVERTURE LÉGÈRE
        if (couverture_section === 'legere') {
            const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
            switch (piecesNum) {
              case 2:
                cout_couverture_legere = 5112000;
                cout_global_couverture_legere = 12780000;
                cout_second_oeuvre = 7668000;
                surface_construite_logement = 86;
                surface_construite_logement1 = 86;
                break;
              case 3:
                cout_couverture_legere = 5912000;
                cout_global_couverture_legere = 14780000;
                cout_second_oeuvre = 8868000;
                surface_construite_logement = 103;
                surface_construite_logement1 = 103;
                break;
              case 4:
                cout_couverture_legere = 7200000;
                cout_global_couverture_legere = 18000000;
                cout_second_oeuvre = 10800000;
                surface_construite_logement = 125;
                surface_construite_logement1 = 125;
                break;
              case 5:
                cout_couverture_legere = 8496000;
                cout_global_couverture_legere = 21240000;
                cout_second_oeuvre = 12744000;
                surface_construite_logement = 146;
                surface_construite_logement1 = 146;
                break;
              case 6:
                cout_couverture_legere = 9784000;
                cout_global_couverture_legere = 24460000;
                cout_second_oeuvre = 14676000;
                surface_construite_logement = 167;
                surface_construite_logement1 = 167;
                break;
              case 7:
                cout_couverture_legere = 11072000;
                cout_global_couverture_legere = 27680000;
                cout_second_oeuvre = 16608000;
                surface_construite_logement = 188;
                surface_construite_logement1 = 188;
                break;
              case 8:
                cout_couverture_legere = 12360000;
                cout_global_couverture_legere = 30900000;
                cout_second_oeuvre = 18540000;
                surface_construite_logement = 209;
                surface_construite_logement1 = 209;
                break;
              case 9:
                cout_couverture_legere = 13648000;
                cout_global_couverture_legere = 34120000;
                cout_second_oeuvre = 20472000;
                surface_construite_logement = 230;
                surface_construite_logement1 = 230;
                break;
              case 10:
                cout_couverture_legere = 14936000;
                cout_global_couverture_legere = 37340000;
                cout_second_oeuvre = 22404000;
                surface_construite_logement = 251;
                surface_construite_logement1 = 251;
                break;
            }
          }
          // COUVERTURE DALLE
          else if (couverture_section === 'dalle') {
            const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
            switch (piecesNum) {
              case 2:
                cout_couverture_dalle = 6390000;
                cout_second_oeuvre = 7668000;
                cout_global_couverture_dalle = 14058000;
                surface_construite_logement = 86;
                surface_construite_logement1 = 86;
                break;
              case 3:
                cout_couverture_dalle = 7390000;
                cout_second_oeuvre = 8868000;
                cout_global_couverture_dalle = 16258000;
                surface_construite_logement = 103;
                surface_construite_logement1 = 103;
                break;
              case 4:
                cout_couverture_dalle = 9000000;
                cout_second_oeuvre = 10800000;
                cout_global_couverture_dalle = 19800000;
                surface_construite_logement = 125;
                surface_construite_logement1 = 125;
                break;
              case 5:
                cout_couverture_dalle = 10620000;
                cout_second_oeuvre = 12744000;
                cout_global_couverture_dalle = 23364000;
                surface_construite_logement = 146;
                surface_construite_logement1 = 146;
                break;
              case 6:
                cout_couverture_dalle = 12230000;
                cout_second_oeuvre = 14676000;
                cout_global_couverture_dalle = 26906000;
                surface_construite_logement = 167;
                surface_construite_logement1 = 167;
                break;
              case 7:
                cout_couverture_dalle = 13840000;
                cout_second_oeuvre = 16608000;
                cout_global_couverture_dalle = 30448000;
                surface_construite_logement = 188;
                surface_construite_logement1 = 188;
                break;
              case 8:
                cout_couverture_dalle = 15450000;
                cout_second_oeuvre = 18540000;
                cout_global_couverture_dalle = 33990000;
                surface_construite_logement = 209;
                surface_construite_logement1 = 209;
                break;
              case 9:
                cout_couverture_dalle = 17060000;
                cout_second_oeuvre = 20472000;
                cout_global_couverture_dalle = 37532000;
                surface_construite_logement = 230;
                surface_construite_logement1 = 230;
                break;
              case 10:
                cout_couverture_dalle = 18670000;
                cout_second_oeuvre = 22404000;
                cout_global_couverture_dalle = 41074000;
                surface_construite_logement = 251;
                surface_construite_logement1 = 251;
                break;
            }
          }
      }
      // ========================================
      // STANDING MOYEN
      // ========================================
      else if (standing === 'moyen') {
        // Calculer les valeurs de base (plain_pied), puis multiplier pour duplex/triplex
        // COUVERTURE LÉGÈRE
        if (couverture_section === 'legere') {
            const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
            switch (piecesNum) {
              case 2:
                cout_couverture_legere = 6848000;
                cout_global_couverture_legere = 23968000;
                cout_second_oeuvre = 17120000;
                surface_construite_logement = 86;
                surface_construite_logement1 = 86;
                break;
              case 3:
                cout_couverture_legere = 8272000;
                cout_global_couverture_legere = 28952000;
                cout_second_oeuvre = 20680000;
                surface_construite_logement = 103;
                surface_construite_logement1 = 103;
                break;
              case 4:
                cout_couverture_legere = 9960000;
                cout_global_couverture_legere = 34860000;
                cout_second_oeuvre = 24900000;
                surface_construite_logement = 125;
                surface_construite_logement1 = 125;
                break;
              case 5:
                cout_couverture_legere = 11648000;
                cout_global_couverture_legere = 40768000;
                cout_second_oeuvre = 29120000;
                surface_construite_logement = 146;
                surface_construite_logement1 = 146;
                break;
              case 6:
                cout_couverture_legere = 13336000;
                cout_global_couverture_legere = 46676000;
                cout_second_oeuvre = 33340000;
                surface_construite_logement = 167;
                surface_construite_logement1 = 167;
                break;
              case 7:
                cout_couverture_legere = 15024000;
                cout_global_couverture_legere = 52584000;
                cout_second_oeuvre = 37560000;
                surface_construite_logement = 188;
                surface_construite_logement1 = 188;
                break;
              case 8:
                cout_couverture_legere = 16712000;
                cout_global_couverture_legere = 58492000;
                cout_second_oeuvre = 41780000;
                surface_construite_logement = 209;
                surface_construite_logement1 = 209;
                break;
              case 9:
                cout_couverture_legere = 18400000;
                cout_global_couverture_legere = 64400000;
                cout_second_oeuvre = 46000000;
                surface_construite_logement = 230;
                surface_construite_logement1 = 230;
                break;
              case 10:
                cout_couverture_legere = 20096000;
                cout_global_couverture_legere = 70336000;
                cout_second_oeuvre = 50240000;
                surface_construite_logement = 251;
                surface_construite_logement1 = 251;
                break;
            }
          }
          // COUVERTURE DALLE  
          else if (couverture_section === 'dalle') {
            const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
            switch (piecesNum) {
              case 2:
                cout_couverture_dalle = 8560000;
                cout_second_oeuvre = 17120000;
                cout_global_couverture_dalle = 25680000;
                surface_construite_logement = 86;
                surface_construite_logement1 = 86;
                break;
              case 3:
                cout_couverture_dalle = 10340000;
                cout_second_oeuvre = 20680000;
                cout_global_couverture_dalle = 31020000;
                surface_construite_logement = 103;
                surface_construite_logement1 = 103;
                break;
              case 4:
                cout_couverture_dalle = 12450000;
                cout_second_oeuvre = 24900000;
                cout_global_couverture_dalle = 37350000;
                surface_construite_logement = 125;
                surface_construite_logement1 = 125;
                break;
              case 5:
                cout_couverture_dalle = 14560000;
                cout_second_oeuvre = 29120000;
                cout_global_couverture_dalle = 43680000;
                surface_construite_logement = 146;
                surface_construite_logement1 = 146;
                break;
              case 6:
                cout_couverture_dalle = 16670000;
                cout_second_oeuvre = 33340000;
                cout_global_couverture_dalle = 50010000;
                surface_construite_logement = 167;
                surface_construite_logement1 = 167;
                break;
              case 7:
                cout_couverture_dalle = 18780000;
                cout_second_oeuvre = 37560000;
                cout_global_couverture_dalle = 56340000;
                surface_construite_logement = 188;
                surface_construite_logement1 = 188;
                break;
              case 8:
                cout_couverture_dalle = 20890000;
                cout_second_oeuvre = 41780000;
                cout_global_couverture_dalle = 62670000;
                surface_construite_logement = 209;
                surface_construite_logement1 = 209;
                break;
              case 9:
                cout_couverture_dalle = 23000000;
                cout_second_oeuvre = 46000000;
                cout_global_couverture_dalle = 69000000;
                surface_construite_logement = 230;
                surface_construite_logement1 = 230;
                break;
              case 10:
                cout_couverture_dalle = 25120000;
                cout_second_oeuvre = 50240000;
                cout_global_couverture_dalle = 75360000;
                surface_construite_logement = 251;
                surface_construite_logement1 = 251;
                break;
            }
          }
      }
      // ========================================
      // STANDING HAUT
      // ========================================
      else if (standing === 'haut') {
        if (logement_type === 'plain_pied') {
          const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
          switch (piecesNum) {
            case 2:
              cout_couverture = 15587000;
              cout_second_oeuvre2 = 70850000;
              cout_global = 86437000;
              surface_construite_logement = 142;
              surface_construite_logement1 = 142;
              break;
            case 3:
              cout_couverture = 20779000;
              cout_second_oeuvre2 = 94450000;
              cout_global = 115229000;
              surface_construite_logement = 189;
              surface_construite_logement1 = 189;
              break;
            case 4:
              cout_couverture = 23353000;
              cout_second_oeuvre2 = 106150000;
              cout_global = 129503000;
              surface_construite_logement = 212;
              surface_construite_logement1 = 212;
              break;
            case 5:
              cout_couverture = 25916000;
              cout_second_oeuvre2 = 117800000;
              cout_global = 143716000;
              surface_construite_logement = 236;
              surface_construite_logement1 = 236;
              break;
            case 6:
              cout_couverture = 28479000;
              cout_second_oeuvre2 = 129450000;
              cout_global = 157929000;
              surface_construite_logement = 259;
              surface_construite_logement1 = 259;
              break;
            case 7:
              cout_couverture = 31053000;
              cout_second_oeuvre2 = 141150000;
              cout_global = 172203000;
              surface_construite_logement = 282;
              surface_construite_logement1 = 282;
              break;
            case 8:
              cout_couverture = 33616000;
              cout_second_oeuvre2 = 152800000;
              cout_global = 186416000;
              surface_construite_logement = 306;
              surface_construite_logement1 = 306;
              break;
            case 9:
              cout_couverture = 36179000;
              cout_second_oeuvre2 = 164450000;
              cout_global = 200629000;
              surface_construite_logement = 329;
              surface_construite_logement1 = 329;
              break;
            case 10:
              cout_couverture = 38753000;
              cout_second_oeuvre2 = 176150000;
              cout_global = 214903000;
              surface_construite_logement = 352;
              surface_construite_logement1 = 352;
              break;
          }
        } else if (logement_type === 'duplex') {
          const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
          switch (piecesNum) {
            case 2:
              cout_couverture = 15587000 * 2;
              cout_second_oeuvre2 = 70850000 * 2;
              cout_global = 172874000;
              surface_construite_logement = 142 * 2;
              surface_construite_logement1 = 142;
              break;
            case 3:
              cout_couverture = 20779000 * 2;
              cout_second_oeuvre2 = 94450000 * 2;
              cout_global = 230458000;
              surface_construite_logement = 189 * 2;
              surface_construite_logement1 = 189;
              break;
            case 4:
              cout_couverture = 23353000 * 2;
              cout_second_oeuvre2 = 106150000 * 2;
              cout_global = 259006000;
              surface_construite_logement = 212 * 2;
              surface_construite_logement1 = 212;
              break;
            case 5:
              cout_couverture = 25916000 * 2;
              cout_second_oeuvre2 = 117800000 * 2;
              cout_global = 287432000;
              surface_construite_logement = 236 * 2;
              surface_construite_logement1 = 236;
              break;
            case 6:
              cout_couverture = 28479000 * 2;
              cout_second_oeuvre2 = 129450000 * 2;
              cout_global = 315858000;
              surface_construite_logement = 259 * 2;
              surface_construite_logement1 = 259;
              break;
            case 7:
              cout_couverture = 31053000 * 2;
              cout_second_oeuvre2 = 141150000 * 2;
              cout_global = 344406000;
              surface_construite_logement = 282 * 2;
              surface_construite_logement1 = 282;
              break;
            case 8:
              cout_couverture = 33616000 * 2;
              cout_second_oeuvre2 = 152800000 * 2;
              cout_global = 372832000;
              surface_construite_logement = 306 * 2;
              surface_construite_logement1 = 306;
              break;
            case 9:
              cout_couverture = 36179000 * 2;
              cout_second_oeuvre2 = 164450000 * 2;
              cout_global = 401258000;
              surface_construite_logement = 329 * 2;
              surface_construite_logement1 = 329;
              break;
            case 10:
              cout_couverture = 38753000 * 2;
              cout_second_oeuvre2 = 176150000 * 2;
              cout_global = 429806000;
              surface_construite_logement = 352 * 2;
              surface_construite_logement1 = 352;
              break;
          }
        } else if (logement_type === 'triplex') {
          const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
          switch (piecesNum) {
            case 2:
              cout_couverture = 15587000 * 3;
              cout_second_oeuvre2 = 70850000 * 3;
              cout_global = 259311000;
              surface_construite_logement = 142 * 3;
              surface_construite_logement1 = 142;
              break;
            case 3:
              cout_couverture = 20779000 * 3;
              cout_second_oeuvre2 = 94450000 * 3;
              cout_global = 345687000;
              surface_construite_logement = 189 * 3;
              surface_construite_logement1 = 189;
              break;
            case 4:
              cout_couverture = 23353000 * 3;
              cout_second_oeuvre2 = 106150000 * 3;
              cout_global = 388509000;
              surface_construite_logement = 212 * 3;
              surface_construite_logement1 = 212;
              break;
            case 5:
              cout_couverture = 25916000 * 3;
              cout_second_oeuvre2 = 117800000 * 3;
              cout_global = 431148000;
              surface_construite_logement = 236 * 3;
              surface_construite_logement1 = 236;
              break;
            case 6:
              cout_couverture = 28479000 * 3;
              cout_second_oeuvre2 = 129450000 * 3;
              cout_global = 473787000;
              surface_construite_logement = 259 * 3;
              surface_construite_logement1 = 259;
              break;
            case 7:
              cout_couverture = 31053000 * 3;
              cout_second_oeuvre2 = 141150000 * 3;
              cout_global = 516609000;
              surface_construite_logement = 282 * 3;
              surface_construite_logement1 = 282;
              break;
            case 8:
              cout_couverture = 33616000 * 3;
              cout_second_oeuvre2 = 152800000 * 3;
              cout_global = 559248000;
              surface_construite_logement = 306 * 3;
              surface_construite_logement1 = 306;
              break;
            case 9:
              cout_couverture = 36179000 * 3;
              cout_second_oeuvre2 = 164450000 * 3;
              cout_global = 601887000;
              surface_construite_logement = 329 * 3;
              surface_construite_logement1 = 329;
              break;
            case 10:
              cout_couverture = 38753000 * 3;
              cout_second_oeuvre2 = 176150000 * 3;
              cout_global = 644709000;
              surface_construite_logement = 352 * 3;
              surface_construite_logement1 = 352;
              break;
          }
        }
      }
      // ========================================
      // STANDING TRÈS HAUT
      // ========================================
      else if (standing === 'tres_haut') {
        if (logement_type === 'plain_pied') {
          const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
          switch (piecesNum) {
            case 2:
              cout_couverture = 24937000;
              cout_second_oeuvre2 = 226700000;
              cout_global = 251637000;
              surface_construite_logement = 142;
              surface_construite_logement1 = 142;
              break;
            case 3:
              cout_couverture = 27379000;
              cout_second_oeuvre2 = 248900000;
              cout_global = 276279000;
              surface_construite_logement = 189;
              surface_construite_logement1 = 189;
              break;
            case 4:
              cout_couverture = 30932000;
              cout_second_oeuvre2 = 281200000;
              cout_global = 312132000;
              surface_construite_logement = 212;
              surface_construite_logement1 = 212;
              break;
            case 5:
              cout_couverture = 34474000;
              cout_second_oeuvre2 = 313400000;
              cout_global = 347874000;
              surface_construite_logement = 236;
              surface_construite_logement1 = 236;
              break;
            case 6:
              cout_couverture = 38016000;
              cout_second_oeuvre2 = 345600000;
              cout_global = 383616000;
              surface_construite_logement = 259;
              surface_construite_logement1 = 259;
              break;
            case 7:
              cout_couverture = 41558000;
              cout_second_oeuvre2 = 377800000;
              cout_global = 419358000;
              surface_construite_logement = 282;
              surface_construite_logement1 = 282;
              break;
            case 8:
              cout_couverture = 45100000;
              cout_second_oeuvre2 = 410000000;
              cout_global = 455100000;
              surface_construite_logement = 306;
              surface_construite_logement1 = 306;
              break;
            case 9:
              cout_couverture = 48653000;
              cout_second_oeuvre2 = 442300000;
              cout_global = 490953000;
              surface_construite_logement = 329;
              surface_construite_logement1 = 329;
              break;
            case 10:
              cout_couverture = 52195000;
              cout_second_oeuvre2 = 474500000;
              cout_global = 526695000;
              surface_construite_logement = 352;
              surface_construite_logement1 = 352;
              break;
          }
        } else if (logement_type === 'duplex') {
          const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
          switch (piecesNum) {
            case 2:
              cout_couverture = 24937000 * 2;
              cout_second_oeuvre2 = 226700000 * 2;
              cout_global = 503274000;
              surface_construite_logement = 142 * 2;
              surface_construite_logement1 = 142;
              break;
            case 3:
              cout_couverture = 27379000 * 2;
              cout_second_oeuvre2 = 248900000 * 2;
              cout_global = 552558000;
              surface_construite_logement = 189 * 2;
              surface_construite_logement1 = 189;
              break;
            case 4:
              cout_couverture = 30932000 * 2;
              cout_second_oeuvre2 = 281200000 * 2;
              cout_global = 624264000;
              surface_construite_logement = 212 * 2;
              surface_construite_logement1 = 212;
              break;
            case 5:
              cout_couverture = 34474000 * 2;
              cout_second_oeuvre2 = 313400000 * 2;
              cout_global = 695748000;
              surface_construite_logement = 236 * 2;
              surface_construite_logement1 = 236;
              break;
            case 6:
              cout_couverture = 38016000 * 2;
              cout_second_oeuvre2 = 345600000 * 2;
              cout_global = 767232000;
              surface_construite_logement = 259 * 2;
              surface_construite_logement1 = 259;
              break;
            case 7:
              cout_couverture = 41558000 * 2;
              cout_second_oeuvre2 = 377800000 * 2;
              cout_global = 838716000;
              surface_construite_logement = 282 * 2;
              surface_construite_logement1 = 282;
              break;
            case 8:
              cout_couverture = 45100000 * 2;
              cout_second_oeuvre2 = 410000000 * 2;
              cout_global = 910200000;
              surface_construite_logement = 306 * 2;
              surface_construite_logement1 = 306;
              break;
            case 9:
              cout_couverture = 48653000 * 2;
              cout_second_oeuvre2 = 442300000 * 2;
              cout_global = 981906000;
              surface_construite_logement = 329 * 2;
              surface_construite_logement1 = 329;
              break;
            case 10:
              cout_couverture = 52195000 * 2;
              cout_second_oeuvre2 = 474500000 * 2;
              cout_global = 1053390000;
              surface_construite_logement = 352 * 2;
              surface_construite_logement1 = 352;
              break;
          }
        } else if (logement_type === 'triplex') {
          const piecesNum = pieces === '10 et plus' ? 10 : parseInt(pieces);
          switch (piecesNum) {
            case 2:
              cout_couverture = 24937000 * 3;
              cout_second_oeuvre2 = 226700000 * 3;
              cout_global = 754911000;
              surface_construite_logement = 142 * 3;
              surface_construite_logement1 = 142;
              break;
            case 3:
              cout_couverture = 27379000 * 3;
              cout_second_oeuvre2 = 248900000 * 3;
              cout_global = 828837000;
              surface_construite_logement = 189 * 3;
              surface_construite_logement1 = 189;
              break;
            case 4:
              cout_couverture = 30932000 * 3;
              cout_second_oeuvre2 = 281200000 * 3;
              cout_global = 936396000;
              surface_construite_logement = 212 * 3;
              surface_construite_logement1 = 212;
              break;
            case 5:
              cout_couverture = 34474000 * 3;
              cout_second_oeuvre2 = 313400000 * 3;
              cout_global = 1043622000;
              surface_construite_logement = 236 * 3;
              surface_construite_logement1 = 236;
              break;
            case 6:
              cout_couverture = 38016000 * 3;
              cout_second_oeuvre2 = 345600000 * 2;
              cout_global = 1150848000;
              surface_construite_logement = 259 * 3;
              surface_construite_logement1 = 259;
              break;
            case 7:
              cout_couverture = 41558000 * 3;
              cout_second_oeuvre2 = 377800000 * 3;
              cout_global = 1258047000;
              surface_construite_logement = 282 * 3;
              surface_construite_logement1 = 282;
              break;
            case 8:
              cout_couverture = 45100000 * 3;
              cout_second_oeuvre2 = 410000000 * 3;
              cout_global = 1365300000;
              surface_construite_logement = 306 * 3;
              surface_construite_logement1 = 306;
              break;
            case 9:
              cout_couverture = 48653000 * 3;
              cout_second_oeuvre2 = 442300000 * 3;
              cout_global = 1472859000;
              surface_construite_logement = 329 * 3;
              surface_construite_logement1 = 329;
              break;
            case 10:
              cout_couverture = 52195000 * 3;
              cout_second_oeuvre2 = 474500000 * 3;
              cout_global = 1580085000;
              surface_construite_logement = 352 * 3;
              surface_construite_logement1 = 352;
              break;
          }
        }
      }

      // ========================================
      // DUPLEX ET TRIPLEX pour ÉCONOMIQUE et MOYEN
      // ========================================
      // Note : Pour standing HAUT et TRÈS HAUT, les duplex/triplex ont déjà des valeurs spécifiques
      // Cette section ne s'applique que pour économique et moyen
      if ((standing === 'economique' || standing === 'moyen') && 
          (logement_type === 'duplex' || logement_type === 'triplex')) {
        const multiplicateur = logement_type === 'duplex' ? 2 : 3;
        
        // Appliquer le multiplicateur
        cout_couverture_legere *= multiplicateur;
        cout_couverture_dalle *= multiplicateur;
        cout_second_oeuvre *= multiplicateur;
        cout_global_couverture_legere *= multiplicateur;
        cout_global_couverture_dalle *= multiplicateur;
        surface_construite_logement *= multiplicateur;
        // surface_construite_logement1 reste la même (surface par niveau)
      }

      // Retourner les résultats pour logement
      result = {
        ...result,
        logement_type,
        pieces,
        couverture_section,
        surface_construite_logement1,
        surface_construite_logement,
      };

      // Pour standing HAUT et TRÈS HAUT : pas de distinction légère/dalle
      if (standing === 'haut' || standing === 'tres_haut') {
        result = {
          ...result,
          cout_couverture,
          cout_second_oeuvre2,
          cout_global,
        };
      } 
      // Pour standing ÉCONOMIQUE et MOYEN : distinction légère/dalle
      else {
        result = {
          ...result,
          cout_couverture_legere,
          cout_couverture_dalle,
          cout_second_oeuvre,
          cout_global_couverture_legere,
          cout_global_couverture_dalle,
          cout_global: couverture_section === 'legere' ? cout_global_couverture_legere : cout_global_couverture_dalle,
          cout_couverture: couverture_section === 'legere' ? cout_couverture_legere : cout_couverture_dalle,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Erreur lors du calcul:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du calcul de l\'estimation' },
      { status: 500 }
    );
  }
}

