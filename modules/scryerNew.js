let wantToScry = false;

function canNatureScry() {
    const scryInPoisonTrue = getEmpowerment() === "Poison" && (getPageSetting('ScryUseinPoison') < 0 || game.global.world >= getPageSetting('ScryUseinPoison'));
    const scryInWindTrue = getEmpowerment() === "Wind" && (getPageSetting('ScryUseinWind') < 0 || game.global.world >= getPageSetting('ScryUseinWind'));
    const scryInIceTrue = getEmpowerment() === "Ice" && (getPageSetting('ScryUseinIce') < 0 || game.global.world >= getPageSetting('ScryUseinIce'));
        if (scryInPoisonTrue) {
            return true;
        }
        if (scryInWindTrue) {
            return true;
        }
        if (scryInIceTrue) {
            return true;
        }
        return false;
    }

function useScryerStance() {

    const AutoStance = getPageSetting('AutoStance');
    const useScryerEnabled = getPageSetting('UseScryerStance') === true;
    const onMap = game.global.mapsActive;
    const onVoidMap = game.global.mapsActive && getCurrentMapObject().location === "Void";
    const inDaily = game.global.challengeActive === "Daily";
    const dailyScryInVoid = getPageSetting('dscryvoidmaps') === true;
    const scryInPoison = getEmpowerment() === "Poison" && (getPageSetting('ScryUseinPoison') < 0) || (game.global.world >= getPageSetting('ScryUseinPoison'));
    const scryInWind = getEmpowerment() === "Wind" && (getPageSetting('ScryUseinWind') < 0) || (game.global.world >= getPageSetting('ScryUseinWind'));
    const scryInIce = getEmpowerment() === "Ice" && (getPageSetting('ScryUseinIce') < 0) || (game.global.world >= getPageSetting('ScryUseinIce'));
    const inNature = (getEmpowerment() === "Poison") || (getEmpowerment() === "Wind") || (getEmpowerment() === "Ice");
    let canScryInCurrentNature = canNatureScry();


    function autostancefunction() {
        if (AutoStance === 1) autoStance();
        else if (AutoStance === 2) autoStance2();
        else if (AutoStance === 3) autoStance3();
    }

//Never
    let neverScry = game.global.preMapsActive || game.global.gridArray.length === 0 || game.global.highestLevelCleared < 180;
    const vmScryerEnabled = getPageSetting('scryvoidmaps') === true;
    const scryInMapsNever = getPageSetting('ScryerUseinMaps2') === 0;
    const scryInVoidNever = getPageSetting('ScryerUseinVoidMaps2') === 0;
    const scryInSpireNever = getPageSetting('ScryerUseinSpire2') === 0;
    const inVoidMap = onMap && onVoidMap;
    const scryOnBossNeverAboveVoid = getPageSetting('ScryerSkipBoss2') === 1;
    const currentZoneBelowVMZone = game.global.world >= getPageSetting('VoidMaps');
    const scryOnBossNever = getPageSetting('ScryerSkipBoss2') === 0;
    const onBossCell = game.global.lastClearedCell >= 98;

    let neverScryGlobal = !useScryerEnabled;
    let neverScryInMaps = onMap && scryInMapsNever && !onVoidMap;
    let neverScryNormalVoid = !vmScryerEnabled && !inDaily;
    let neverScryDailyVoid = !dailyScryInVoid && inDaily;
    let neverScryInVoid = inVoidMap && scryInVoidNever && neverScryNormalVoid && neverScryDailyVoid;
    let neverScryInSpire = !onMap && isActiveSpireAT() && scryInSpireNever;
    let neverScryOnBoss = (scryOnBossNeverAboveVoid && currentZoneBelowVMZone && onBossCell) || (scryOnBossNever && onBossCell);

    neverScry = neverScry || game.global.world <= 60;
    neverScry = neverScry || neverScryGlobal;
    neverScry = neverScry || neverScryInMaps;
    neverScry = neverScry || neverScryInVoid;
    neverScry = neverScry || neverScryInSpire;
    neverScry = neverScry || neverScryOnBoss;
    neverScry = neverScry || (!game.global.mapsActive && !canScryInCurrentNature);

    //check Corrupted Never
    const currentEnemy = getCurrentEnemy(1);
    const isMagmaCell = mutations.Magma.active();
    const corruptionStartZone = mutations.Corruption.start();
    const scryForCorruptedCellsNever = getPageSetting('ScryerSkipCorrupteds2') === 0;

    let isCorruptedCell = currentEnemy && currentEnemy.mutation === "Corruption";
    let inCorruptionVoid = inVoidMap && game.global.world >= corruptionStartZone;

    isCorruptedCell = isCorruptedCell || (onMap && isMagmaCell);
    isCorruptedCell = isCorruptedCell || inCorruptionVoid;

    neverScry = (neverScry) || (isCorruptedCell && scryForCorruptedCellsNever);

    if (neverScry) {
        autostancefunction();
        wantToScry = false;
        return;
    }

    //check Healthy never
    const currentEnemyHealth = getCurrentEnemy(1);
    const scryForHealthyCellsNever = getPageSetting('ScryerSkipHealthy') === 0;

    let isHealthyCell = currentEnemyHealth && currentEnemyHealth.mutation === "Healthy";
    isHealthyCell = isHealthyCell || (inVoidMap && game.global.world >= corruptionStartZone);
    neverScry = (neverScry) || (isHealthyCell && scryForHealthyCellsNever);

    if (neverScry) {
        autostancefunction();
        wantToScry = false;
        return;
    }

//Force
    let scryInMapsForce = getPageSetting('ScryerUseinMaps2') === 1;
    let scryInVoidForce = getPageSetting('ScryerUseinVoidMaps2') === 1;
    let scryInSpireForce = getPageSetting('ScryerUseinSpire2') === 1;

    let forceScry = useScryerEnabled && onMap && scryInMapsForce;
    let forceScryInSpire = (!onMap && useScryerEnabled && isActiveSpireAT() && scryInSpireForce);

    forceScry = forceScry || (inVoidMap && ((scryInVoidForce) || (vmScryerEnabled && !inDaily) || (dailyScryInVoid && inDaily)));
    forceScry = forceScry || forceScryInSpire;

    //check Corrupted Force
    const scryForCorruptedCellsForce = getPageSetting('ScryerSkipCorrupteds2') === 1;
    forceScry = forceScry || useScryerEnabled && scryForCorruptedCellsForce && isCorruptedCell;

    if (forceScry) {
        if (!onMap && inNature) {
            if (canScryInCurrentNature) {
                setFormation(4);
                wantToScry = true;
                return;
            }
            else{
                autostancefunction();
            }
        }
        else {
            setFormation(4);
            wantToScry = true;
            return;
        }
    }

    //check Healthy force
    const scryForHealthyCellsForce = getPageSetting('ScryerSkipHealthy') === 1;
    forceScry = forceScry || isHealthyCell && scryForHealthyCellsForce && useScryerEnabled;

    if (forceScry) {
        if (!onMap && inNature) {
            if (canScryInCurrentNature) {
                setFormation(4);
                wantToScry = true;
                return;
            }
            else{
                autostancefunction();
            }
        }
        else {
            setFormation(4);
            wantToScry = true;
            return;
        }
    }

//Calc Damage
    if (AutoStance === 1)
        calcBaseDamageinX();
    else if (AutoStance >= 2)
        calcBaseDamageinX2();

//Suicide to Scry
    const missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
    const isNewSquadReady = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
    const dieToScryZone = getPageSetting('ScryerDieZ');
    const dieToScryEnabled = dieToScryZone !== -1;
    const aboveDieToScryZone = game.global.world >= dieToScryZone;

    let okToSwitchStance = true;
    let isAllowedToDie = (dieToScryEnabled && aboveDieToScryZone);
    if (isAllowedToDie && dieToScryZone >= 0) {
        var [dieZ, dieC] = dieToScryZone.toString().split(".");
        if (dieC && dieC.length === 1) dieC = dieC + "0";
        isAllowedToDie = game.global.world >= dieZ && (!dieC || (game.global.lastClearedCell + 1 >= dieC));
    }
    const inXFormation = game.global.formation === 0;
    const inHFormation = game.global.formation === 1;

    if (inXFormation || inHFormation)
        okToSwitchStance = isAllowedToDie || isNewSquadReady || (missingHealth < (baseHealth / 2));

//Overkill
    const noOverkillLevels = game.portal.Overkill.level === 0;
    const hasOverkillLevels = game.portal.Overkill.level > 0;

    let scryForOverkill = getPageSetting('ScryerUseWhenOverkill');
    if (scryForOverkill && noOverkillLevels)
        setPageSetting('ScryerUseWhenOverkill', false);
    if (scryForOverkill && !onMap && isActiveSpireAT() && scryInSpireNever)
        scryForOverkill = false;
    if (scryForOverkill && hasOverkillLevels && useScryerEnabled && forceScry) {
        const minDamage = calcOurDmg("min", false, true);
        const Sstance = 0.5;
        const ovkldmg = minDamage * Sstance * (game.portal.Overkill.level * 0.005);
        const ovklHDratio = getCurrentEnemy(1).maxHealth / ovkldmg;
        if (ovklHDratio < 2) {
            if (okToSwitchStance)
                if (inNature) {
                    if (canScryInCurrentNature) {
                        setFormation(4);
                    }
                    else{
                        autostancefunction();
                    }
                }
                else {
                    setFormation(4);
                }
            return;
        }
    }

//Default
    const min_zone = getPageSetting('ScryerMinZone');
    const max_zone = getPageSetting('ScryerMaxZone');
    const valid_min = game.global.world >= min_zone && game.global.world > 60;
    const valid_max = max_zone <= 0 || game.global.world < max_zone;
    const onlyScryForMinMaxEnabled = getPageSetting('onlyminmaxworld') === true;

    if (useScryerEnabled && valid_min && valid_max && !(onlyScryForMinMaxEnabled && onMap)) {
        if (okToSwitchStance)
            if (inNature) {
                if (canScryInCurrentNature) {
                    setFormation(4);
                }
                else{
                    autostancefunction();
                }
            }
            else {
                setFormation(4);
            }

        wantToScry = true;
    }
    else {
        autostancefunction();
        wantToScry = false;
    }
}
