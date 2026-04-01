package com.amitbc.japanexplorer

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import java.util.Locale
import kotlin.math.absoluteValue
import kotlin.math.floor
import kotlin.random.Random

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { JapanExplorerApp() }
    }
}

enum class Screen(val route: String, val title: String) {
    Home("home", "🏠 Home"), Expenses("expenses", "💴 Expenses"), Dictionary("dict", "📖 Dictionary"),
    Toilet("toilet", "🚽 Toilet Guide"), Wheel("wheel", "🎡 Lucky Wheel"), Game("game", "🎮 Game")
}

@Composable
fun JapanExplorerApp() {
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        val nav = rememberNavController()
        val drawerState = rememberDrawerState(DrawerValue.Closed)
        val scope = rememberCoroutineScope()
        var selected by remember { mutableStateOf(Screen.Home.route) }
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                ModalDrawerSheet(drawerContainerColor = Color(0xFA1A1A2E)) {
                    Text("🇯🇵 JapanTrip 2026", color = Color(0xFFFeca57), modifier = Modifier.padding(16.dp))
                    Screen.entries.forEach {
                        NavigationDrawerItem(
                            label = { Text(it.title) },
                            selected = selected == it.route,
                            colors = NavigationDrawerItemDefaults.colors(selectedContainerColor = Color(0x66E94560)),
                            onClick = {
                                selected = it.route
                                nav.navigate(it.route)
                                scope.launch { drawerState.close() }
                            }
                        )
                    }
                }
            }
        ) {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = { Text("JapanTrip 2026") },
                        navigationIcon = {
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(Icons.Default.Menu, contentDescription = null)
                            }
                        }
                    )
                },
                containerColor = Color.Transparent
            ) { pad ->
                Box(
                    Modifier
                        .fillMaxSize()
                        .background(Brush.linearGradient(listOf(Color(0xFF1A1A2E), Color(0xFF16213E), Color(0xFF0F3460))))
                        .padding(pad)
                ) {
                    NavHost(navController = nav, startDestination = Screen.Home.route) {
                        composable(Screen.Home.route) { HomeScreen() }
                        composable(Screen.Expenses.route) { ExpensesScreen() }
                        composable(Screen.Dictionary.route) { DictionaryScreen() }
                        composable(Screen.Toilet.route) { ToiletScreen() }
                        composable(Screen.Wheel.route) { WheelScreen() }
                        composable(Screen.Game.route) { GameScreen() }
                    }
                }
            }
        }
    }
}

data class ExchangeRateResponse(val rates: Map<String, Double>)
data class WikiThumb(val source: String?)
data class WikiResponse(val extract: String?, val thumbnail: WikiThumb?)

data class Expense(
    val id: String = "",
    val desc: String = "",
    val amount: Double = 0.0,
    val currency: String = "JPY",
    val payer: String = "Amit",
    val split: List<String> = listOf("Amit", "Moshe", "Omri"),
    val customSplit: Map<String, Double>? = null,
    val timestamp: Long = System.currentTimeMillis()
)

interface ApiService {
    @GET("v4/latest/ILS")
    suspend fun rate(): ExchangeRateResponse

    @GET("api/rest_v1/page/summary/{place}")
    suspend fun wiki(@Path("place") place: String): WikiResponse
}

val exApi: ApiService = Retrofit.Builder().baseUrl("https://api.exchangerate-api.com/")
    .addConverterFactory(GsonConverterFactory.create()).build().create(ApiService::class.java)
val wikiApi: ApiService = Retrofit.Builder().baseUrl("https://en.wikipedia.org/")
    .addConverterFactory(GsonConverterFactory.create()).build().create(ApiService::class.java)

@Composable
fun HomeScreen() {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    var rate by remember { mutableDoubleStateOf(40.5) }
    var offline by remember { mutableStateOf(true) }
    var showConverter by remember { mutableStateOf(false) }
    var ils by remember { mutableStateOf("1") }
    var jpy by remember { mutableStateOf("40.5") }
    var reverse by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    LaunchedEffect(Unit) {
        while (true) {
            now = System.currentTimeMillis(); delay(1000)
        }
    }
    LaunchedEffect(Unit) {
        runCatching { exApi.rate().rates["JPY"] ?: 40.5 }.onSuccess { rate = it; offline = false }
    }
    LaunchedEffect(ils, jpy, reverse, rate) {
        if (reverse) ils = ((jpy.toDoubleOrNull() ?: 0.0) / rate).toString() else jpy = ((ils.toDoubleOrNull() ?: 0.0) * rate).toString()
    }
    val target = 1791305100000L
    val rem = (target - now).coerceAtLeast(0)
    val d = rem / 86_400_000
    val h = (rem / 3_600_000) % 24
    val m = (rem / 60_000) % 60
    val s = (rem / 1000) % 60

    LazyColumn(Modifier.fillMaxSize().padding(15.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("🇯🇵 JapanTrip 2026", fontSize = 30.sp, fontWeight = FontWeight.Bold,
                style = TextStyle(brush = Brush.horizontalGradient(listOf(Color(0xFFE94560), Color(0xFFFF6B6B), Color(0xFFFECA57))))
            )
            Text("Amit · Moshe · Omri", color = Color(0x99FFFFFF))
        }
        item {
            if (rem == 0L) Text("🎉 We are in Japan! 🎉", color = Color.White)
            else Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
                    listOf("${d}".padStart(3, '0'), "${h}".padStart(2, '0'), "${m}".padStart(2, '0'), "${s}".padStart(2, '0')).forEach {
                        Card { Text(it, modifier = Modifier.padding(10.dp), fontSize = 22.sp) }
                    }
                }
            }
        }
        item { Button(onClick = { showConverter = !showConverter }) { Text("💱 Currency Converter") } }
        if (showConverter) item {
            Card {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(ils, { ils = it }, label = { Text("₪") }, enabled = !reverse, modifier = Modifier.weight(1f))
                        TextButton(onClick = { reverse = !reverse }) { Text("⇄") }
                        OutlinedTextField(jpy, { jpy = it }, label = { Text("¥") }, enabled = reverse, modifier = Modifier.weight(1f))
                    }
                    Text("1 ₪ = ${"%.2f".format(rate)} ¥${if (offline) " (offline)" else ""}")
                }
            }
        }
        item { Text("🗾 תכנון הטיול", color = Color(0xFFFECA57), modifier = Modifier.fillMaxWidth()) }
        item { ItineraryWidget() }
    }
}

@Composable fun ItineraryWidget() { Text("Itinerary CRUD connected to Firestore should be added here (scaffold included).", color = Color.White) }

@Composable
fun ExpensesScreen() {
    val db = remember { FirebaseFirestore.getInstance() }
    var desc by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var currency by remember { mutableStateOf("JPY") }
    var payer by remember { mutableStateOf("Amit") }
    var expenses by remember { mutableStateOf(listOf<Expense>()) }
    LaunchedEffect(Unit) {
        db.collection("expenses").addSnapshotListener { snap, _ ->
            expenses = snap?.documents?.mapNotNull { d -> d.toObject(Expense::class.java)?.copy(id = d.id) }?.sortedByDescending { it.timestamp } ?: emptyList()
        }
    }
    LazyColumn(Modifier.fillMaxSize().padding(15.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Card { Column(Modifier.padding(12.dp)) {
                Text("➕ Add Expense"); OutlinedTextField(desc, { desc = it }, label = { Text("Description") })
                OutlinedTextField(amount, { amount = it }, label = { Text("Amount") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
                Row { listOf("JPY","ILS").forEach { TextButton({ currency = it }) { Text(it) } } }
                Row { listOf("Amit","Moshe","Omri").forEach { FilterChip(selected = payer==it,onClick={payer=it},label={Text(it)}) } }
                Button(onClick = {
                    db.collection("expenses").add(
                        mapOf("desc" to desc, "amount" to (amount.toDoubleOrNull() ?: 0.0), "currency" to currency, "payer" to payer,
                            "split" to listOf("Amit", "Moshe", "Omri"), "customSplit" to null, "timestamp" to System.currentTimeMillis())
                    )
                    desc=""; amount=""
                }) { Text("➕ Add Expense") }
            } }
        }
        item { Text("📋 All Expenses", color = Color.White) }
        items(expenses) { e ->
            Card { Row(Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Column { Text(e.desc); Text("Paid by: ${e.payer}") }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(if (e.currency=="JPY") "¥${e.amount}" else "₪${e.amount}")
                    TextButton(onClick = { db.collection("expenses").document(e.id).delete() }) { Text("✕") }
                }
            } }
        }
    }
}

data class Phrase(val he: String, val romaji: String, val jp: String)
@Composable
fun DictionaryScreen() {
    val ctx = LocalContext.current
    var tts by remember { mutableStateOf<TextToSpeech?>(null) }
    DisposableEffect(Unit) {
        val engine = TextToSpeech(ctx) { it }
        engine.language = Locale.JAPAN
        engine.setSpeechRate(0.8f)
        tts = engine
        onDispose { engine.shutdown() }
    }
    val phrases = remember {
        listOf(
            Phrase("שלום", "Konnichiwa", "こんにちは"),
            Phrase("תודה", "Arigatou gozaimasu", "ありがとうございます"),
            Phrase("איפה השירותים?", "Toire wa doko desu ka", "トイレはどこですか")
        )
    }
    var q by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().padding(15.dp)) {
        OutlinedTextField(q, { q = it }, placeholder = { Text("חפש מילה בעברית או באנגלית...") })
        Spacer(Modifier.height(10.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(phrases.filter { it.he.contains(q) || it.romaji.contains(q, true) }) { p ->
                Card { Column(Modifier.padding(12.dp)) {
                    Text(p.he, color = Color(0xFFFECA57), fontWeight = FontWeight.Bold)
                    Text(p.romaji)
                    Text(p.jp, color = Color(0xFFAAAAAA))
                    Button(onClick = { tts?.speak(p.jp, TextToSpeech.QUEUE_FLUSH, null, p.jp) }) { Text("🔊 Speak") }
                } }
            }
        }
    }
}

@Composable
fun ToiletScreen() {
    val items = listOf("💦" to "Small flush","💦💦" to "Big flush","🍑💦" to "Bidet (rear)","👩💦" to "Bidet (front)","💨" to "Dry","⏹️" to "Stop","🎵" to "Sound (privacy)","🌡️" to "Seat temperature")
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("🚽 Japanese Toilet Guide", color = Color.White)
        Spacer(Modifier.height(8.dp))
        items.chunked(2).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                row.forEach {
                    Card(Modifier.weight(1f)) { Column(Modifier.padding(18.dp), horizontalAlignment = Alignment.CenterHorizontally) { Text(it.first, fontSize = 30.sp); Text(it.second) } }
                }
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

data class Place(val name: String, val category: String, val address: String, val icon: String)
@Composable
fun WheelScreen() {
    val places = listOf(
        Place("Ichiran Ramen","Ramen","Shibuya","🍜"), Place("Sukiyabashi Jiro","Sushi","Ginza","🍣"), Place("Tsukiji Market","Market","Tsukiji","🐟"),
        Place("Afuri Ramen","Ramen","Harajuku","🍜"), Place("Gonpachi","Izakaya","Nishi-Azabu","🏮"), Place("Kura Sushi","Sushi","Various","🍣")
    )
    val rotation = remember { Animatable(0f) }
    var result by remember { mutableStateOf<Place?>(null) }
    val scope = rememberCoroutineScope()
    Column(Modifier.fillMaxSize().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("▼", color = Color(0xFFE94560))
        Canvas(Modifier.size(260.dp)) {
            val sweep = 360f / places.size
            val colors = listOf(Color(0xFFE94560), Color(0xFF0F3460), Color(0xFF533483), Color(0xFF16213E), Color(0xFF2B9348))
            rotate(rotation.value) {
                places.forEachIndexed { i, _ ->
                    drawArc(colors[i % colors.size], i * sweep, sweep, true, size = size)
                }
            }
            drawCircle(Color.White, radius = 15.dp.toPx(), center = center)
        }
        Button(onClick = {
            scope.launch {
                val spin = Random.nextInt(5, 9) * 360 + Random.nextInt(0, 360)
                rotation.animateTo(rotation.value + spin, tween(4000))
                val sweep = 360f / places.size
                val idx = (((270 - (rotation.value % 360) + 360) % 360) / sweep).toInt().coerceIn(0, places.lastIndex)
                result = places[idx]
            }
        }) { Text("Spin! 🎰") }
        result?.let { Card { Text("${it.icon} ${it.name} • ${it.category} • ${it.address}", modifier = Modifier.padding(12.dp)) } }
    }
}

data class Question(val q: String, val options: List<String>, val answer: Int)
@Composable
fun GameScreen() {
    val qs = listOf(
        Question("How do you say \"Thank you\" in Japanese?", listOf("Sumimasen", "Arigatou gozaimasu", "Hai", "Iie"), 1),
        Question("What does \"Sumimasen\" mean?", listOf("Thank you", "Yes", "Excuse me", "No"), 2)
    )
    var idx by remember { mutableIntStateOf(0) }
    var score by remember { mutableIntStateOf(0) }
    var selected by remember { mutableStateOf<Int?>(null) }
    val q = qs[idx % qs.size]
    Column(Modifier.fillMaxSize().padding(15.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(q.q, color = Color.White)
        q.options.forEachIndexed { i, op ->
            val isCorrect = selected != null && i == q.answer
            val isWrong = selected == i && i != q.answer
            OutlinedButton(onClick = { if (selected == null) { selected = i; if (i == q.answer) score++ } }, colors = ButtonDefaults.outlinedButtonColors(
                containerColor = when { isCorrect -> Color(0x4D52B788); isWrong -> Color(0x4DE94560); else -> Color.Transparent }
            )) { Text(op) }
        }
        Text("Score: $score / ${idx+1}", color = Color(0x99FFFFFF))
        if (selected != null) Button(onClick = { idx++; selected = null }) { Text("Next ➡️") }
    }
}
